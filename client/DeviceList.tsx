import React, {useEffect, useState} from 'react';
import {DeviceInfo} from "../src/defines";

const DATA_REFRESH_RATE = 30*1000;

const DeviceList = () => {

    const [devices, setDevices] = useState<DeviceInfo[]>([])

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
        <div id="device-list">
            <h2 className="title">Device List</h2>
            {devices.map((device, index) => (
                <div key={index} className={`device-item ${(!device.active && device.inactive_counter >= 1) ? 'inactive' : ''}`}>
                    <p className="mac-address">MAC Address: {device.mac_address}</p>
                    <p className={`active-status ${(!device.active && device.inactive_counter >= 1) ? 'inactive-status' : ''}`}>
                        Active Status: {(!device.active && device.inactive_counter >= 1) ? 'Inactive' : 'Active'}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default DeviceList;