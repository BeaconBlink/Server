import React from "react";
import "../public/style.css"
import {HashRouter, Route, Routes} from "react-router-dom";
import Menu from "./Menu";
import DeviceConfigPage from "./DeviceConfigPage";
import RoomConfigPage from "./RoomConfigPage";
import HomePage from "./HomePage";

const App: React.FC = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Menu />}>
                    <Route index element={<HomePage />} />
                    <Route path="/config/device" element={<DeviceConfigPage />} />
                    <Route path="/config/rooms" element={<RoomConfigPage />} />
                </Route>
            </Routes>
        </HashRouter>
    );
};

export default App;