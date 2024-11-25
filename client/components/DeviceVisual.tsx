import React, { useState, useEffect } from "react";
import Select from "react-select";
import Device from "../../src/model/device";
import Room from "../../src/model/room";
import axios from "axios";

interface DeviceVisualProps {
    device: Device;
}

const DeviceVisual: React.FC<DeviceVisualProps> = ({ device}) => {

    const isActive = (lastConnected: Date) => {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        return lastConnected >= tenMinutesAgo;
    };

    return (
        <div className="flex flex-col items-center w-14 h-14 md:w-16 md:h-16">
            <div
                className={`w-4 h-4 md:w-6 md:h-6 rounded-full ${
                    isActive(new Date(device.last_connected)) ? "bg-green-500" : "bg-red-500"
                }`}
            ></div>
            <p className="overflow-hidden whitespace-nowrap max-w-full cursor-help text-ellipsis text-sm md:text-base"
               title={device.alias || device.mac_address}>
                {device.alias || device.mac_address}
            </p>
        </div>
    );
};

export default DeviceVisual;