
import React, {useEffect, useState} from "react";
import Room from "../../src/model/room";
import axios from "axios";

import {FaPen, FaTrashAlt} from "react-icons/fa";
import Device from "../../src/model/device";
import Select, {MultiValue} from "react-select";


interface RoomListElementProps {
    room: Room;
    onDelete: (room: Room) => void;
}

const RoomListElement: React.FC<RoomListElementProps> = ({ room, onDelete }) => {

    const [isEditingName, setIsEditingName] = useState(false);
    const [newRoomName, setNewRoomName] = useState(room.name);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [calibratingDevices, setCalibratingDevices] = useState<Device[]>([]);
    const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
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

    const getAvailableDevices = async () => {
        try {
            const response = await axios.get(`devices/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching available devices:', error);
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

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [devices, calibratingDevs] = await Promise.all([
                getAvailableDevices(),
                getDevicesByCalibratedRoom()
            ]);

            setAvailableDevices(devices);
            setCalibratingDevices(calibratingDevs);
            // Set initial selected devices based on calibrating devices
            setSelectedDevices(calibratingDevs.map((device: Device) => device.mac_address));
            setIsLoading(false);
            setCanSend(true);
        };

        fetchData();
    }, [room._id]);

    useEffect(() => {
        console.log("selected: ", selectedDevices);
        if(canSend){
            const sendCalibratingDevices = async () => {
                try {
                    await axios.post(`/calibration`, { roomId: room._id, devices: selectedDevices });
                } catch (error) {
                    console.error('Error sending calibrating devices:', error);
                }
            };
            sendCalibratingDevices();
        }
    }, [selectedDevices]);



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
            label: device.alias || device.mac_address
        }));
    };

    const deviceOptions = mapDevicesToOptions(availableDevices);

    return (
        <>
            <div className={`bg-complementary-color p-4 rounded-md flex-col justify-between items-center h-80 md:h-72 m-4 w-full lg:w-5/12`}>
                <div className="flex flex-col h-2/3">
                    <div className="flex h-1/3 justify-between items-center w-full">
                        <div className="flex flex-col h-full w-3/4 justify-evenly">
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
                                    className="text-accenct-color2 font-bold bg-transparent border-b border-accenct-color2 outline-none"
                                />
                            ) : (
                                <h1 className="text-accenct-color2 font-bold">{room.name}</h1>
                            )}
                        </div>
                    </div>

                    <div className="flex h-1/3 items-center space-x-2">
                        <>
                            <p className="text-accenct-color">{selectedDevices.length > 0 ? "Calibrating with: " : (room.calibrated ? "Calibrated" : "Not Calibrated")}</p>
                            <Select
                                isMulti
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
                        </>
                    </div>
                </div>

                <div className="flex flex-col justify-evenly h-1/3">
                <div className=" flex items-center h-2/3 justify-evenly space-x-4">
                        <button
                            onClick={() => setIsEditingName(!isEditingName)}
                            className="w-1/6 md:w-1/4 flex justify-evenly items-center px-4 py-2 text-accenct-color bg-accenct-color2 rounded-md focus:outline-none"
                        >
                            <FaPen/>
                            <span className="hidden md:block">Change name</span>
                        </button>
                        <button
                            onClick={() => setShowDeleteDialog(true)}
                            className="w-1/6 md:w-1/4 flex justify-evenly items-center px-4 py-2 text-accenct-color bg-red-500 hover:bg-red-600 rounded-md focus:outline-none"
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
                        <h2 className="text-xl text-accenct-color2 font-bold mb-4">Delete room</h2>
                        <p className="mb-6 text-accenct-color">
                            Are you sure you want to delete room{' '}
                            <span className="font-semibold">
                                {room.name}
                            </span>
                            ? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                className="px-4 py-2 bg-complementary-color text-accenct-color2 hover:bg-black rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-accenct-color rounded-md hover:bg-red-600"
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