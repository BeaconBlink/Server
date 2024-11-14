import React from 'react';
import {Link, Outlet} from 'react-router-dom';
import { TbHomeCog , TbHome, TbDeviceTabletCog} from "react-icons/tb";
import { SiIbeacon } from "react-icons/si";

const Menu: React.FC = () => {
    return (
        <div>
        <div className="fixed top-0 left-0 right-0 flex items-center justify-between p-4 main-theme z-50">
            <div className="hidden md:block">
                <Link to="/" className="flex items-center space-x-2">
                    <SiIbeacon className="text-3xl" />
                    <h1 className="text-xl font-bold">BeaconBlink</h1>
                </Link>
            </div>
            <div className="flex space-x-4">
                <Link to="/" className="text-2xl">
                    <TbHome />
                </Link>
                <Link to="/config/device" className="text-2xl">
                    <TbDeviceTabletCog />
                </Link>
                <Link to="/config/rooms" className="text-2xl">
                    <TbHomeCog />
                </Link>
            </div>
        </div>
        <Outlet />
        </div>
    );
};

export default Menu;