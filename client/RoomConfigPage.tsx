import React from "react";
import RoomList from "./components/RoomList"
const RoomConfigPage: React.FC = () => {
    return (
        <div className="main-theme min-h-screen w-screen flex pt-20 flex-col items-center">
            <div className="md:w-4/5 w-11/12 rounded-md">
                <div className="w-full px-6 py-4 flex justify-between items-center">
                    <div className="flex items-end space-x-2">
                        <h1 className="text-5xl font-bold text-accent-color2">Saved Rooms</h1>
                    </div>
                </div>
                <div className="px-6 py-8 w-full">
                    <RoomList></RoomList>
                </div>
            </div>
        </div>
    );
};

export default RoomConfigPage;