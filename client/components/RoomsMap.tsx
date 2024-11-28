import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import Device from "../../src/model/device";
import Room from "../../src/model/room";
import axios from "axios";
import RoomVisual from "./RoomVisual";
import "../../public/style.css"

interface RoomsMapProps {
    devices: Device[];
    rooms: Room[];
}

const RoomsMap: React.FC<RoomsMapProps> = ({ devices, rooms }) => {
    const gridLayout = useMemo(() => {
        const roomCount = rooms.length;

        // Find the smallest square grid that can contain all rooms
        const gridSize = Math.min(4, Math.ceil(Math.sqrt(roomCount)));

        return {
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridAutoRows: '1fr'
        };
    }, [rooms]);

    return (
        <div
            className="grid justify-center items-start h-full w-full gap-8 overflow-y-auto rooms-map-grid"
            style={gridLayout}
        >
            {rooms.map((room) => (
                <RoomVisual
                    key={room._id?.toString()}
                    room={room}
                    devices={devices.filter((d) => d.location && room._id && d.location.toString() === room._id.toString())}
                />
            ))}
        </div>
    );
};

export default RoomsMap;