import React, { useEffect, useState } from 'react';
import Room from "../../src/model/room";
import RoomListElement from "./RoomListElement";
import { FaPlus } from "react-icons/fa";
import Device from "../../src/model/device";

const DATA_REFRESH_RATE = 5 * 1000;

const RoomList = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [newRoomName, setNewRoomName] = useState<string>("");
    const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [availableDevices, setAvailableDevices] = useState<Device[]>([]);



    const onDeleteRoom = (room: Room) => {
        setRooms(rooms.filter((r) => r.name !== room.name));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCreateRoom();
            setIsCreatingRoom(false);
        } else if (e.key === 'Escape') {
            setIsCreatingRoom(false);
            setNewRoomName("");
        }
    };

    const handleCreateRoom = async () => {
        if (newRoomName.trim() === "") return;

        // @ts-ignore
        const newRoom = new Room(newRoomName, false, [], []);

        const response = await fetch('/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newRoom),
        });

        if (response.ok) {
            setRooms([...rooms, newRoom]);
            setNewRoomName("");
        } else {
            console.error('Error creating room:', response.statusText);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/rooms');
            const data = await response.json();
            setRooms(data);

            const response2 = await fetch('/rooms/tags');
            const data2 = await response2.json();
            setAvailableTags(data2)

            const response3 = await fetch('/devices');
            const data3 = await response3.json();
            setAvailableDevices(data3);
        };

        fetchData().catch((error) => {
            console.error('Error fetching data:', error);
        });

        const intervalId = setInterval(fetchData, DATA_REFRESH_RATE);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-wrap justify-evenly items-start">
            <div className="w-full mb-4 flex justify-center md:justify-start">
                {isCreatingRoom ? (
                    <input
                        type="text"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter room name"
                        className="md:w-1/3 w-full border rounded-2xl p-2 mr-2 bg-main-color text-accent-color"
                        autoFocus
                    />
                ) : (
                    <button
                        onClick={() => setIsCreatingRoom(true)}
                        className="px-4 py-2 bg-accent-color2 text-accent-color rounded-md md:w-1/6 w-1/2 flex items-center justify-center"
                    >
                        New Room
                        <FaPlus className="ml-2"/>
                    </button>
                )}
            </div>
            {rooms.map((room, index) => (
                <RoomListElement key={index} room={room} onDelete={onDeleteRoom} availableTags={availableTags} setAvailableTags={setAvailableTags} availableDevices={availableDevices} setAvailableDevices={setAvailableDevices} />
            ))}
        </div>
    );
};

export default RoomList;