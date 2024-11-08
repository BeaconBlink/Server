import React, {useEffect, useState} from 'react';
import DeviceListElement from "./DeviceListElement";
import Device from "../../src/model/device";

const DATA_REFRESH_RATE = 5*1000;

const DeviceList = () => {

    const [devices, setDevices] = useState<Device[]>([]);

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

    return (
        <div className="flex flex-wrap justify-evenly items-start">
            {devices.map((device, index) => (
                <DeviceListElement key={index} device={device} onSetAlias={() => console.log("")} onPingTest={() => console.log("")} onDelete={() => console.log("")} />
            ))}
        </div>
    );
};

export default DeviceList;