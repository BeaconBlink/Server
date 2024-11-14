import React, {useState} from 'react';
import { FaPen, FaTrashAlt, FaSignal } from 'react-icons/fa';
import {TbBattery, TbBattery1, TbBattery2, TbBattery3, TbBattery4, TbLoader} from "react-icons/tb";
import Device from "../../src/model/device";
import axios from "axios";

interface DeviceListElementProps {
    device: Device
    isActive: boolean
    onDelete: (device: Device) => void;
}

const DeviceListElement: React.FC<DeviceListElementProps> = ({
                                                                 device,
                                                                 onDelete,
                                                                 isActive
                                                             }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [newAlias, setNewAlias] = useState(device.alias);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleTestPing = async () => {
        try {
            await axios.post(`/test_ping`, { mac_address: device.mac_address });
        } catch (error) {
            console.error('Error pinging device:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`devices/${device.mac_address}`);
            onDelete(device);
        } catch (error) {
            console.error('Error deleting device:', error);
        }
    };


    const handleNameUpdate = async () => {
        try {

            const updatedDevice = {
                ...device,
                alias: newAlias
            };

            delete updatedDevice._id;

            const response = await axios.put(
                `devices/${device.mac_address}`,
                updatedDevice
            );

            if (response.status === 200) {
                device.alias = newAlias; // Update the alias in the device object
            }

            setIsEditingName(false);
        } catch (error) {
            console.error('Error updating device name:', error);
        }
    };


    const getBatteryIcon = (batteryLevel: number) => {
        const iconSize = 32;
        if (batteryLevel <= 20) {
            return <TbBattery className="text-red-500" size={iconSize} />;
        } else if (batteryLevel <= 40) {
            return <TbBattery1 className="text-red-500" size={iconSize} />;
        } else if (batteryLevel <= 60) {
            return <TbBattery2 className="text-yellow-500" size={iconSize} />;
        } else if (batteryLevel <= 80) {
            return <TbBattery3 className="text-green-500" size={iconSize} />;
        } else {
            return <TbBattery4 className="text-green-500" size={iconSize} />;
        }
    };

    return (
        <>
        <div className={`bg-complementary-color p-4 rounded-md flex-col justify-between items-center h-80 md:h-72 m-4 w-full lg:w-5/12 ${!isActive ? 'opacity-50' : ''}`}>
            <div className="flex flex-col h-2/3">
                <div className="flex h-1/3 justify-between items-center w-full">
                    <div className="flex flex-col h-full w-3/4 justify-evenly">
                        {isEditingName ? (
                            <input
                                type="text"
                                value={newAlias}
                                onChange={(e) => setNewAlias(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleNameUpdate();
                                    }
                                    if (e.key === 'Escape') {
                                        setIsEditingName(false);
                                        setNewAlias(device.alias);
                                    }
                                }}
                                autoFocus
                                className="text-accenct-color2 font-bold bg-transparent border-b border-accenct-color2 outline-none"
                            />
                        ) : (
                            <h1 className="text-accenct-color2 font-bold">{device.alias !== "" ? newAlias : device.mac_address}</h1>
                        )}
                        {(device.alias != "" || isEditingName) &&
                            <p className="text-accenct-color2 opacity-50">Mac address: {device.mac_address}</p>}
                    </div>
                    <div className="w-1/4 flex justify-end items-center">
                        {getBatteryIcon(device.battery_level)}
                        <p className="text-accenct-color">{device.battery_level}%</p>
                    </div>
                </div>

                <div className="flex h-1/3 flex-col justify-evenly">
                    <h1 className="text-accenct-color2 font-bold">Last location: {device.location}</h1>
                    <p className="text-accenct-color2 opacity-50">Last login: {device.last_connected.toString()}</p>
                </div>

                {device.calibration_mode &&
                    <div className="flex h-1/3 items-center space-x-2">
                        <TbLoader size={32} className={`${isActive ? 'text-green-500' : 'text-red-500'}`}/>
                        <p className="text-accenct-color"> Calibrating: {device.calibrated_room}</p>
                    </div>}
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
                    <button onClick={handleTestPing}
                            className="w-2/3 md:w-1/4 flex justify-evenly items-center px-4 py-2  text-accenct-color bg-accenct-color2 rounded-md focus:outline-none">
                        <FaSignal/>
                        <span className="text-xs md:text-base">Test Ping</span>
                    </button>
                    <button
                        onClick={() => setShowDeleteDialog(true)}
                        className="w-1/6 md:w-1/4 flex justify-evenly items-center px-4 py-2 text-accenct-color bg-red-500 hover:bg-red-600 rounded-md focus:outline-none"
                    >
                        <FaTrashAlt/>
                        <span className="hidden md:block">Delete</span>
                    </button>
                </div>
                <div className={`rounded-lg w-full mb-2 h-4 ${isActive ? "bg-green-500" : "bg-red-500"}`}></div>
            </div>
        </div>

            {/* Custom Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-main-color rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl text-accenct-color2 font-bold mb-4">Delete Device</h2>
                        <p className="mb-6 text-accenct-color">
                            Are you sure you want to delete device{' '}
                            <span className="font-semibold">
                                {device.alias || device.mac_address}
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

export default DeviceListElement;