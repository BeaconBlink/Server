
import React, {useEffect, useState} from "react";
import Room from "../../src/model/room";
import axios from "axios";

import {FaPen, FaTrashAlt} from "react-icons/fa";
import Device from "../../src/model/device";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";


interface RoomListElementProps {
    room: Room;
    onDelete: (room: Room) => void;
    availableTags: string[];
    setAvailableTags: (tags: string[]) => void;
    availableDevices: Device[];
    setAvailableDevices: (devices: Device[]) => void;

}

const RoomListElement: React.FC<RoomListElementProps> = ({ room, onDelete, availableTags, setAvailableTags, availableDevices, setAvailableDevices }) => {

    const [isEditingName, setIsEditingName] = useState(false);
    const [newRoomName, setNewRoomName] = useState(room.name);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [calibratingDevices, setCalibratingDevices] = useState<Device[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [canSend, setCanSend] = useState(false);

    const handleDelete = async () => {
        try {
            await axios.delete(`rooms/${room._id}`);
            onDelete(room);
            setShowDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    };

    const getDevicesByCalibratedRoom = async () => {
        try {
            // @ts-ignore
            const response = await axios.post(`devices/calibrating/`, { roomId: room._id });
            return response.data;
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    const getAvailableTags = async () => {
        try {
            const response = await axios.get(`rooms/tags`);
            return response.data;
        } catch (error) {
            console.error('Error fetching available tags:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [calibratingDevs, tags] = await Promise.all([
                getDevicesByCalibratedRoom(),
                getAvailableTags()
            ]);

            setCalibratingDevices(calibratingDevs);
            setAvailableTags(tags)
            // Set initial selected devices based on calibrating devices
            setSelectedDevices(calibratingDevs.map((device: Device) => device.mac_address));
            setSelectedTags(room.tags);
            setIsLoading(false);
            setCanSend(true);
        };

        fetchData();
    }, [room._id]);

    useEffect(() => {
        if(canSend){
            const sendCalibratingDevices = async () => {
                try {
                    await axios.post(`/calibration`, { roomId: room._id, devices: selectedDevices });

                    const updatedDevices = availableDevices.map(device => {
                        if (selectedDevices.includes(device.mac_address)) {
                            return { ...device, calibration_mode: true, calibrated_room: room._id };
                        }
                        else{
                            if(device.calibrated_room != undefined && device.calibration_mode == true && device.calibrated_room.equals(room._id)) {
                                return { ...device, calibration_mode: false, calibrated_room: undefined };
                            }
                        }
                        return device;
                    });

                    setAvailableDevices(updatedDevices);
                } catch (error) {
                    console.error('Error sending calibrating devices:', error);
                }
            };
            sendCalibratingDevices();
        }
    }, [selectedDevices]);

    useEffect(() => {
        if(canSend){
            const sendNewTags = async () => {
                try {
                    const updatedRoom = {
                        ...room,
                        tags: selectedTags
                    };

                    delete updatedRoom._id;

                    const response = await axios.put(`rooms/${room._id}`, updatedRoom);

                    if (response.status === 200) {
                        room.tags = selectedTags;
                    }
                } catch (error) {
                    console.error('Error updating room name:', error);
                }
            };
            sendNewTags();
        }
        const uniqueTags = Array.from(new Set([...availableTags, ...selectedTags]));
        setAvailableTags(uniqueTags);

    }, [selectedTags]);


    const handleNameUpdate = async () => {
        try {

            const updatedRoom = {
                ...room,
                name: newRoomName
            };

            delete updatedRoom._id;

            const response = await axios.put(
                `rooms/${room._id}`,
                updatedRoom
            );

            if (response.status === 200) {
                room.name = newRoomName; // Update the alias in the device object
            }

            setIsEditingName(false);
            setNewRoomName(room.name);
        } catch (error) {
            console.error('Error updating room name:', error);
        }
    };



    const mapDevicesToOptions = (devices: Device[]) => {
        return devices.map((device) => ({
            value: device.mac_address,
            label: device.alias || device.mac_address,
            isDisabled: device.calibration_mode
        }));
    };

    const deviceOptions = mapDevicesToOptions(availableDevices);

    const customTheme = (theme: any) => ({
        ...theme,
        colors: {
            ...theme.colors,
            primary25: 'var(--main-color)',
            primary: 'var(--complementary-color)',
            neutral0: 'var(--main-color)',
            neutral80: 'var(--accent-color)',
        },
    })


    const customStyles = {
        multiValue: (styles: any) => ({
            ...styles,
            backgroundColor: 'var(--accent-color2)',
        }),
        multiValueLabel: (styles: any) => ({
            ...styles,
            color: 'var(--accent-color)',
        }),
        multiValueRemove: (styles: any) => ({
            ...styles,
            color: 'var(--accent-color)',
            ':hover': {
                backgroundColor: 'var(--accent-color2)',
                color: 'var(--accent-color)',
            },
        }),
    };

    return (
        <>
            <div className={`bg-complementary-color p-4 rounded-md flex-col justify-between items-center h-96 m-4 w-full lg:w-5/12`}>
                <div className="flex flex-col h-3/4">
                    <div className="flex h-1/3  nd:h-1/4 justify-between items-center w-full mb-2">
                        <div className="flex flex-col h-full w-3/4">
                            {isEditingName ? (
                                <input
                                    type="text"
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleNameUpdate();
                                        }
                                        if (e.key === 'Escape') {
                                            setIsEditingName(false);
                                            setNewRoomName(room.name);
                                        }
                                    }}
                                    autoFocus
                                    className="text-accent-color2 font-bold bg-transparent border-b border-accenct-color2 outline-none"
                                />
                            ) : (
                                <h1 className="text-accent-color2 font-bold">{room.name}</h1>
                            )}
                            {room.last_calibration != undefined &&
                            <h2 className="text-accent-color2 opacity-50">Last calibration: {room.last_calibration.toString()}</h2>}
                        </div>
                    </div>

                    <div className="flex flex-col h-2/3 md:h-3/4 space-x-2">
                        <div>
                            <p className="text-accent-color2">{selectedDevices.length > 0 ? "Calibrating with: " : (room.calibrated ? "Calibrated" : "Not Calibrated")}</p>
                            <Select
                                isMulti
                                isSearchable
                                theme={customTheme}
                                styles={customStyles}
                                options={deviceOptions}
                                placeholder={"Select device to start calibrating"}
                                value={deviceOptions.filter(option =>
                                    selectedDevices.includes(option.value)
                                )}
                                onChange={selected => {
                                    const selectedValues = selected.map(s => s.value);
                                    setSelectedDevices(selectedValues);
                                }}
                                isLoading={isLoading}
                            />
                        </div>
                        <div>
                            <p className="text-accent-color2">Tags:</p>
                            <CreatableSelect
                                theme={customTheme}
                                styles={customStyles}
                                isMulti
                                options={availableTags.map(tag => ({ value: tag, label: tag }))}
                                value={selectedTags.map(tag => ({ value: tag, label: tag }))}
                                onChange={selected => {
                                    const selectedValues = selected.map(s => s.value);
                                    setSelectedTags(selectedValues);
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-evenly h-1/4">
                <div className=" flex items-center h-2/3 justify-evenly space-x-4">
                        <button
                            onClick={() => setIsEditingName(!isEditingName)}
                            className="w-1/6 md:w-1/4 flex justify-evenly items-center px-4 py-2 text-accent-color bg-accent-color2 rounded-md focus:outline-none"
                        >
                            <FaPen/>
                            <span className="hidden md:block">Change name</span>
                        </button>
                        <button
                            onClick={() => setShowDeleteDialog(true)}
                            className="w-1/6 md:w-1/4 flex justify-evenly items-center px-4 py-2 text-accent-color bg-red-500 hover:bg-red-600 rounded-md focus:outline-none"
                        >
                            <FaTrashAlt/>
                            <span className="hidden md:block">Delete</span>
                        </button>
                    </div>
                    <div className={`rounded-lg w-full mb-2 h-4 ${room.calibrated ? "bg-green-500" : "bg-red-500"}`}></div>
                </div>
            </div>

            {/* Custom Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-main-color rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl text-accent-color2 font-bold mb-4">Delete room</h2>
                        <p className="mb-6 text-accent-color">
                            Are you sure you want to delete room{' '}
                            <span className="font-semibold">
                                {room.name}
                            </span>
                            ? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                className="px-4 py-2 bg-complementary-color text-accent-color2 hover:bg-black rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-accent-color rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RoomListElement