import React from 'react';
import DeviceList from "./components/DeviceList";

const DeviceConfigPage: React.FC = () => {
    return (
        <div className="main-theme h-screen w-screen">
            <h2 className="title text-accenct-color2 font-bold">Saved devices</h2>
            <DeviceList></ DeviceList>
        </div>

    );
};

export default DeviceConfigPage;