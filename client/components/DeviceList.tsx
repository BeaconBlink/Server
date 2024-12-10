import React, {useEffect, useState} from 'react';
import DeviceListElement from "./DeviceListElement";
import Device from "../../src/model/device";
import Room from "../../src/model/room";

const DATA_REFRESH_RATE = 5*1000;

const DeviceList = () => {

    const [devices, setDevices] = useState<Device[]>([]);
    const [deviceLocations, setDeviceLocations] = useState<{ [key: string]: string }>({});

    const getRoomNameById = async (roomId: string) => {
        const response = await fetch(`/rooms/${roomId}`);
        const data = await response.json() as Room;
        return data.name;
    }

    const fetchDeviceLocations = async (devices: Device[]) => {
        const locations: { [key: string]: string } = {};
        for (const device of devices) {
            if (device.location) {
                const roomName = await getRoomNameById(device.location.toString());
                locations[device.mac_address] = roomName;
            }
        }
        setDeviceLocations(locations);
    };

    const onDeleteDevice = (device: Device) => {
        setDevices(devices.filter((d) => d.mac_address !== device.mac_address));
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/devices');
            const data = await response.json();
            setDevices(data);
            await fetchDeviceLocations(data);
        };

        fetchData().catch((error) => {
            console.error('Error fetching data:', error);
        });

        const intervalId = setInterval(fetchData, DATA_REFRESH_RATE);

        return () => clearInterval(intervalId);
    }, []);

    const isActive = (lastConnected: Date) => {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        return lastConnected >= tenMinutesAgo;
    };

    const sortedDevices = devices.sort((a, b) => {
        const isActiveA = isActive(new Date(a.last_connected));
        const isActiveB = isActive(new Date(b.last_connected));

        if (isActiveA && !isActiveB) return -1;
        if (!isActiveA && isActiveB) return 1;

        const aliasA = a.alias || a.mac_address;
        const aliasB = b.alias || b.mac_address;

        return aliasA.localeCompare(aliasB);
    });

    return (
        <div className="flex flex-wrap justify-evenly items-start">
            {sortedDevices.map((device, index) => (
                <DeviceListElement key={index} device={device} onDelete={onDeleteDevice} isActive={isActive(new Date(device.last_connected))} deviceLocation={deviceLocations[device.mac_address] || ""}/>
            ))}
        </div>
    );
};

export default DeviceList;