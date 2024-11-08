import React from 'react';
import { FaPen, FaTrashAlt, FaSignal } from 'react-icons/fa';
import {TbBattery, TbBattery1, TbBattery2, TbBattery3, TbBattery4, TbLoader} from "react-icons/tb";
import Device from "../../src/model/device";

interface DeviceListElementProps {
    device: Device
    onSetAlias: () => void;
    onPingTest: () => void;
    onDelete: () => void;
}

const DeviceListElement: React.FC<DeviceListElementProps> = ({
                                                                 device,
                                                                 onSetAlias,
                                                                 onPingTest,
                                                                 onDelete
                                                             }) => {
    const [isActive, setIsActive] = React.useState(true);
    const [isCalibrating, setIsCalibrating] = React.useState(false);

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
        <div className={`bg-complementary-color p-4 rounded-md flex-col justify-between items-center h-80 md:h-72 m-4 w-full lg:w-5/12 ${!isActive ? 'opacity-50' : ''}`}>
            <div className="flex flex-col h-2/3">
                <div className="flex h-1/3 justify-between items-center w-full">
                    <div className="flex flex-col h-full w-3/4 justify-evenly">
                        <h1 className="text-accenct-color2 font-bold">{device.alias != "" ? device.alias : device.mac_address}</h1>
                        {device.alias != "" &&
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

                {isCalibrating &&
                    <div className="flex h-1/3 items-center space-x-2">
                        <TbLoader size={32} className={`${isActive ? 'text-green-500' : 'text-red-500'}`}/>
                        <p className="text-accenct-color"> Calibrating: {device.calibrated_room}</p>
                    </div>}
            </div>

            <div className="flex flex-col justify-evenly h-1/3">
                <div className=" flex items-center h-2/3 justify-evenly space-x-4">
                    <button onClick={onSetAlias}
                            className="w-1/6 md:w-1/4 flex justify-evenly items-center px-4 py-2 text-accenct-color bg-accenct-color2 rounded-md focus:outline-none">
                        <FaPen/>
                        <span className="hidden md:block">Change name</span>
                    </button>
                    <button onClick={() => {
                        setIsCalibrating(!isCalibrating)
                    }}
                            className="w-2/3 md:w-1/4 flex justify-evenly items-center px-4 py-2  text-accenct-color bg-accenct-color2 rounded-md focus:outline-none">
                        <FaSignal/>
                        <span className="text-xs md:text-base">Test Ping</span>
                    </button>
                    <button onClick={() => {
                        setIsActive(!isActive)
                    }}
                            className="w-1/6 md:w-1/4 flex justify-evenly items-center px-4 py-2 text-accenct-color bg-red-500 hover:bg-red-600 rounded-md focus:outline-none">
                        <FaTrashAlt/>
                        <span className="hidden md:block">Delete</span>
                    </button>
                </div>
                <div className={`rounded-lg w-full mb-2 h-4 ${isActive ? "bg-green-500" : "bg-red-500"}`}></div>
            </div>
        </div>
    );
};

export default DeviceListElement;