import React, {useEffect, useState} from 'react';
import {DeviceInfo} from "../src/defines";

const DATA_REFRESH_RATE = 30*1000;

function isDeviceActive(device: DeviceInfo): boolean {
    return !(!device.active && device.inactive_counter >= 1);
}

const DeviceList = () => {

    const [devices, setDevices] = useState<DeviceInfo[]>([]);
    const [message, setMessage] = useState<string>("");

    const sendMessage = async (mac_address: string) => {
        try {
            const response = await fetch('/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mac_address, message }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Message sent");
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

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
            <input type="text" className="message-input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter message" />
            {devices.map((device, index) => (
                <div key={index} className={`device-item ${isDeviceActive(device) ? '' : 'inactive'}`}>
                    <p className="mac-address">MAC Address: {device.mac_address}</p>
                    <p className={`active-status ${isDeviceActive(device) ? '' : 'inactive-status'}`}>
                        Active Status: {isDeviceActive(device) ? 'Active' : 'Inactive'}
                    </p>
                    <button onClick={() => sendMessage(device.mac_address)} disabled={!isDeviceActive(device)}>Send Message
                    </button>
                </div>
            ))}
        </div>
    );
};

export default DeviceList;