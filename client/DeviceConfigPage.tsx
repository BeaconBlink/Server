import React from 'react';
import DeviceList from "./components/DeviceList";
import { TbInfoSquareRounded } from "react-icons/tb";

const DeviceConfigPage: React.FC = () => {
    return (
        <div className="main-theme min-h-screen w-screen flex pt-20 flex-col items-center">
            <div className="md:w-4/5 w-11/12 rounded-md">
                <div className="w-full px-6 py-4 flex justify-between items-center">
                    <div className="flex items-end space-x-2">
                        <h1 className="text-5xl font-bold text-accenct-color2">Saved Devices</h1>
                        <TbInfoSquareRounded
                            className="text-accenct-color2 cursor-help"
                            size={32}
                            title="New devices will be shown once detected by the server. Make sure to setup the device before coming here."
                        />
                    </div>
                </div>
                <div className="px-6 py-8 w-full">
                    <DeviceList />
                </div>
            </div>
        </div>
    );
};

export default DeviceConfigPage;