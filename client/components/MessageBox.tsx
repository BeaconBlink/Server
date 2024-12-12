import React, { useState, useEffect } from "react";
import Select from "react-select";
import Device from "../../src/model/device";
import Room from "../../src/model/room";
import axios from "axios";
import { TbSend2 } from "react-icons/tb";

interface MessageBoxProps {
    devices: Device[];
    rooms: Room[];
    filteredRooms: Room[];
}

const MessageBox: React.FC<MessageBoxProps> = ({ devices, rooms, filteredRooms }) => {
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
    groupedOptions.push({
        label: 'No Room',
        options: devices
            .filter(device => !device.location)
            .filter(device => !selectedDevices.includes(device.mac_address))
            .map(device => ({
                label: device.alias || device.mac_address,
                value: device.mac_address
            }))
    })
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

    // @ts-ignore
    return (
        <div className="h-full p-4 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4">
                {filteredRooms.map(room => (
                    <div key={room._id?.toString()} className="mb-4">
                        <h3 className="font-bold text-lg mb-2 text-accent-color2">{room.name}</h3>
                        <ul className="list-inside">
                            {devices
                                .filter(device => room._id && device.location && device.location.toString() === room._id.toString())
                                .map(device => (
                                    <li className="ml-4 my-2" key={device.mac_address}>
                                        {device.alias || device.mac_address}
                                    </li>
                                ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="h-auto w-full flex flex-col">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message"
                className="w-full p-2 mb-4 border rounded bg-main-color text-accent-color"
            />
                <div className="flex h-auto mb-8 md:mb-0 justify-evenly items-center">
                    <Select
                        options={groupedOptions}
                        onChange={(selectedOption) => setSelectedDevices(selectedOption ? (selectedOption as any).map((option: any) => option.value) : [])}
                        placeholder="Select devices to send the message"
                        className="pr-4 w-auto"
                        isMulti
                        styles={customStyles}
                        theme={customTheme}
                        menuPlacement="auto"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-accent-color2 text-accent-color p-2 rounded w-12 h-12 flex justify-center items-center"
                    >
                        <TbSend2 size={24} className="text-accent-color"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageBox;