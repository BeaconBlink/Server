import React, { useEffect, useState } from 'react';
import Room from "../../src/model/room";
import RoomListElement from "./RoomListElement";

const DATA_REFRESH_RATE = 5 * 1000;

const RoomList = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [newRoomName, setNewRoomName] = useState<string>("");

    const onDeleteRoom = (room: Room) => {
        setRooms(rooms.filter((r) => r.name !== room.name));
    };

    const handleCreateRoom = async () => {
        if (newRoomName.trim() === "") return;

        // @ts-ignore
        const newRoom = new Room(newRoomName, false, null, [], []);

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
        };

        fetchData().catch((error) => {
            console.error('Error fetching data:', error);
        });

        const intervalId = setInterval(fetchData, DATA_REFRESH_RATE);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-wrap justify-evenly items-start">
            <div className="w-full mb-4">
                <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Enter room name"
                    className="border p-2 mr-2"
                />
                <button
                    onClick={handleCreateRoom}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                    Create Room
                </button>
            </div>
            {rooms.map((room, index) => (
                <RoomListElement key={index} room={room} onDelete={onDeleteRoom} />
            ))}
        </div>
    );
};

export default RoomList;