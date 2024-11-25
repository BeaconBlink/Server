import React, { useState, useEffect } from "react";
import Select from "react-select";
import Device from "../../src/model/device";
import Room from "../../src/model/room";
import axios from "axios";
import RoomVisual from "./RoomVisual";

interface RoomsMapProps {
    devices: Device[];
    rooms: Room[];
}

const RoomsMap: React.FC<RoomsMapProps> = ({ devices, rooms }) => {

    return (
        <div className="flex flex-wrap justify-center items-center h-full w-full gap-8">
            {rooms.map((room) => {
                return (
                    <RoomVisual room={room} devices={devices.filter((d) => d.location && room._id && d.location.toString() === room._id.toString())}/>
                    )})}
        </div>
    );
};

export default RoomsMap;