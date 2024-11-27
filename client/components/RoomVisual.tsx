import React from "react";
import Device from "../../src/model/device";
import Room from "../../src/model/room";
import DeviceVisual from "./DeviceVisual";

interface RoomVisualProps {
    devices: Device[];
    room: Room;
}

const RoomVisual: React.FC<RoomVisualProps> = ({ devices, room }) => {
    return (
        <div className="flex flex-col items-center min-w-40 min-h-40 md:min-w-52 md:min-h-52 flex-grow aspect-square">
            <div className="aspect-square border-accent-color2 border-4 min-w-40 min-h-40 md:min-w-52 md:min-h-52 md:max-w-xl md:max-h-[576px] flex flex-wrap justify-center items-center gap-2 flex-grow">
                {devices.map((device) => (
                    <DeviceVisual key={device.mac_address} device={device} />
                ))}
            </div>
            <h2>{room.name}</h2>
        </div>
    );
};

export default RoomVisual;