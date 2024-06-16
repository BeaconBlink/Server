import React, {useEffect, useState} from 'react';
import {DeviceInfo} from "../src/defines";
import DeviceListElement from "./DeviceListElement";

const DATA_REFRESH_RATE = 30*1000;

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
            setMessage("");
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
                <DeviceListElement index={index} device = {device} sendMessage={sendMessage}></DeviceListElement>
            ))}
        </div>
    );
};

export default DeviceList;