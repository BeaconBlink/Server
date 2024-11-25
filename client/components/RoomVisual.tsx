import React, { useState, useEffect } from "react";
import Select from "react-select";
import Device from "../../src/model/device";
import Room from "../../src/model/room";
import axios from "axios";
import DeviceVisual from "./DeviceVisual";

interface RoomVisualProps {
    devices: Device[];
    room: Room;
}

const RoomVisual: React.FC<RoomVisualProps> = ({ devices, room}) => {

    return (
        <div className="flex flex-col items-center w-40 h-44 md:w-52 md:h-56">
            <div className="border-accent-color2 border-4 w-40 h-40 md:w-52 md:h-52 flex flex-wrap justify-center items-center gap-2">
                {devices.map((device) => {
                   return <DeviceVisual device={device}/>
                })
                }
            </div>
            <h2>{room.name}</h2>
        </div>
    );
};

export default RoomVisual;