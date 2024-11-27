import React, {useEffect, useState} from "react";
import { TbMessageCircle } from "react-icons/tb";
import Select from "react-select";
import Room from "../src/model/room";
import Device from "../src/model/device";
import { IoMdClose } from "react-icons/io";
import MessageBox from "./components/MessageBox";
import RoomsMap from "./components/RoomsMap";


const HomePage: React.FC = () => {
    const [showMessages, setShowMessages] = useState(false);
    const [tag, setTag] = useState<string>("");
    const [allTags, setAllTags] = useState<{ label: string, value: string }[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [deviceLocations, setDeviceLocations] = useState<{ [key: string]: string }>({});

    const DATA_REFRESH_RATE = 5*1000;

    const getDevicesInRoom = (roomId: string) => {
        return devices.filter((device) => device.location && device.location.toString() === roomId);
    }

    const getRoomNameById = async (roomId: string) => {
        const response = await fetch(`/rooms/${roomId}`);
        const data = await response.json() as Room;
        return data.name;
    };

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

    const fetchTags = async () => {
        const response = await fetch("/rooms/tags");
        const data = await response.json();
        const formattedTags = data.map((tag: string) => ({ label: tag, value: tag }));
        setAllTags(formattedTags);
    };

    const fetchRooms = async () => {
        const response = await fetch("/rooms");
        const data = await response.json();
        setRooms(data);
    };

    useEffect(() => {
        fetchTags().catch((error) => {
            console.error("Error fetching tags:", error);
        });

        fetchRooms().catch((error) => {
            console.error("Error fetching rooms:", error);
        });

    }, []);

    useEffect(() => {
        if (tag === "") {
            setFilteredRooms(rooms);
        } else {
            setFilteredRooms(rooms.filter((room) => room.tags.includes(tag)));
        }
    }, [tag]);

    const toggleMessages = () => {
        setShowMessages(!showMessages);
    };

    const customTheme = (theme: any) => ({
        ...theme,
        colors: {
            ...theme.colors,
            primary25: 'var(--main-color)',
            primary: 'var(--complementary-color)',
            neutral0: 'var(--main-color)',
            neutral80: 'var(--accent-color)',
        },
    })


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
        <div className="main-theme h-screen w-screen flex flex-col items-center">
            <div className="h-full pt-20 w-11/12 rounded-md flex flex-col">
                <div className="flex h-1/6 justify-between content-center p-4 w-full">
                    <div className="flex md:flex-row flex-col gap-2 w-4/5 md:w-full">
                        <h1 className="text-2xl md:text-3xl font-bold text-accent-color2">Display rooms based on tag: </h1>
                        <Select
                            options={allTags}
                            styles={customStyles}
                            className={"md:w-1/3 w-full"}
                            theme={customTheme}
                            onChange={(selected) => setTag(selected ? selected.value : "")}
                        />
                    </div>
                    <button onClick={toggleMessages} className="bg-accent-color2 text-accent-color block md:hidden px-4 py-2 rounded">
                        <TbMessageCircle size={24} className="text-accent-color"/>
                    </button>
                </div>
                <div className="flex justify-between flex-1 h-full">
                    <div className="flex-1 p-4 md:h-auto h-full overflow-y-scroll">
                        <RoomsMap rooms={filteredRooms} devices={devices}/>
                    </div>
                    <div
                        className={`flex-none w-1/4 p-4 hidden md:block`}>
                        <MessageBox devices={devices} rooms={rooms} filteredRooms={filteredRooms}/>
                    </div>
                </div>
            </div>


            {showMessages && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center w-screen h-screen z-50 md:hidden">
                    <div className="bg-main-color rounded-lg p-6 w-full h-full overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl text-accent-color2 font-bold">Send Message</h2>
                            <button onClick={toggleMessages} className="bg-accent-color2 rounded-2xl p-2">
                                <IoMdClose size={24} className="text-accent-color"></IoMdClose>
                            </button>
                        </div>
                        <div>
                            <MessageBox devices={devices} rooms={rooms} filteredRooms={filteredRooms}/>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;