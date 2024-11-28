import React, { useMemo } from 'react';
import Device from "../../src/model/device";
import Room from "../../src/model/room";
import DeviceVisual from "./DeviceVisual";
import "../../public/style.css"

interface RoomVisualProps {
    devices: Device[];
    room: Room;
}

const RoomVisual: React.FC<RoomVisualProps> = ({ devices, room }) => {
    const gridLayout = useMemo(() => {
        const deviceCount = devices.length;

        // Find the smallest square grid that can contain all devices
        const columns = Math.min(3, Math.ceil(Math.sqrt(deviceCount)));

        return {
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridAutoRows: '1fr',
            justifyContent: 'center',
            alignItems: 'center',
        };
    }, [devices]);

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="w-52 md:w-52 h-52 md:h-52 flex justify-center items-center">
                <div
                    className="w-full h-full aspect-square border-4 border-accent-color2 grid gap-2 overflow-auto room-visual-grid"
                    style={gridLayout}
                >
                    {devices.map((device) => (
                        <DeviceVisual key={device.mac_address} device={device} />
                    ))}
                </div>
            </div>
            <h2 className="mt-2 text-center">{room.name}</h2>
        </div>
    );
};

export default RoomVisual;