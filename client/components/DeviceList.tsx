import React, {useEffect, useState} from 'react';
import DeviceListElement from "./DeviceListElement";
import Device from "../../src/model/device";

const DATA_REFRESH_RATE = 5*1000;

const DeviceList = () => {

    const [devices, setDevices] = useState<Device[]>([]);

    const onDeleteDevice = (device: Device) => {
        setDevices(devices.filter((d) => d.mac_address !== device.mac_address));
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/devices');
            const data = await response.json();
            console.log("fetched data")
            setDevices(data);
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
        return Number(isActive(new Date(b.last_connected))) - Number(isActive(new Date(a.last_connected)));
    });

    return (
        <div className="flex flex-wrap justify-evenly items-start">
            {sortedDevices.map((device, index) => (
                <DeviceListElement key={index} device={device} onDelete={onDeleteDevice} isActive={isActive(new Date(device.last_connected))}/>
            ))}
        </div>
    );
};

export default DeviceList;