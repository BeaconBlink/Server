import React, { useState, useEffect } from "react";
import Select from "react-select";
import Device from "../../src/model/device";
import Room from "../../src/model/room";
import axios from "axios";

interface MessageBoxProps {
    devices: Device[];
    rooms: Room[];
}

const MessageBox: React.FC<MessageBoxProps> = ({ devices, rooms }) => {
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [message, setMessage] = useState<string>("");

    const handleSendMessage = async () => {
        if (selectedDevices.length > 0 && message.trim()) {
            setMessage("");
            try {
                const response = await axios.post('/message', {
                    mac_addresses: selectedDevices,
                    message: message
                });
                console.log('Message sent successfully:', response.data);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const groupedOptions = rooms.map(room => ({
        label: room.name,
        options: devices
            .filter(device => room._id && device.location && device.location.toString() === room._id.toString())
            .filter(device => !selectedDevices.includes(device.mac_address))
            .map(device => ({
                label: device.alias || device.mac_address,
                value: device.mac_address
            }))
    }));

    const customTheme = (theme: any) => ({
        ...theme,
        colors: {
            ...theme.colors,
            primary25: 'var(--main-color)',
            primary: 'var(--complementary-color)',
            neutral0: 'var(--main-color)',
            neutral80: 'var(--accent-color)',
        },
    });

    const customStyles = {
        multiValue: (styles: any) => ({
            ...styles,
            backgroundColor: 'var(--accent-color2)',
        }),
        multiValueLabel: (styles: any) => ({
            ...styles,
            color: 'var(--accent-color)',
        }),
        multiValueRemove: (styles: any) => ({
            ...styles,
            color: 'var(--accent-color)',
            ':hover': {
                backgroundColor: 'var(--accent-color2)',
                color: 'var(--accent-color)',
            },
        }),
    };

    return (
        <div className="p-4">
            <Select
                options={groupedOptions}
                onChange={(selectedOption) => setSelectedDevices(selectedOption ? (selectedOption as any).map((option: any) => option.value) : [])}
                placeholder="Select devices to send the message"
                className="mb-4"
                isMulti
                styles={customStyles}
                theme={customTheme}
            />
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message"
                className="w-full p-2 mb-4 border rounded bg-main-color text-accent-color"
            />
            <button
                onClick={handleSendMessage}
                className="bg-accent-color2 text-accent-color px-4 py-2 rounded"
            >
                Send
            </button>
        </div>
    );
};

export default MessageBox;