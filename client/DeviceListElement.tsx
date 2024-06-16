import React, {useState} from "react";
import {DeviceInfo} from "../src/defines";

interface DeviceListElementProps {
    index: number;
    device: DeviceInfo;
    sendMessage: (value: string) => void;
}

const DeviceListElement : React.FC<DeviceListElementProps> = ({ index, device, sendMessage }) => {

    const [calibrationMode, setCalibrationMode] = useState(device.calibrationMode)
    const [room, setRoom] = useState("")
    const [calibratedRoom, setCalibratedRoom] = useState(device.calibratedRoom)
    const [roomList, setRoomList] = useState<string[]>([])

    function isDeviceActive(device: DeviceInfo): boolean {
        return !(!device.active && device.inactive_counter >= 1);
    }

    const calibrationModeChanged = async (mac_address: string, calibration_mode: boolean, room: string) => {
        try {
            const response = await fetch('/calibration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mac_address, calibration_mode, room }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Calibration mode changed: " + calibration_mode + " for device: " + mac_address + " in room: " + room);
            setCalibrationMode(!calibrationMode);
            setCalibratedRoom(room);
            setRoom("");
        } catch (error) {
            console.error('Error changing calibration mode:', error);
        }
    }

    return(
        <div key={index} className={`device-item ${isDeviceActive(device) ? '' : 'inactive'}`}>
            <p className="mac-address">MAC Address: {device.mac_address}</p>
            <p className={`active-status ${isDeviceActive(device) ? '' : 'inactive-status'}`}>
                Active Status: {isDeviceActive(device) ? 'Active' : 'Inactive'}
            </p>
            <button onClick={() => sendMessage(device.mac_address)} disabled={!isDeviceActive(device)}>Send
                Message
            </button>
            {calibrationMode ? (
                <p>Calibrating for room: {calibratedRoom}</p>
            ) : (
                <input type="text" value={room} onChange={(e) => setRoom(e.target.value)}
                       disabled={!isDeviceActive(device)} placeholder="Enter room to be calibrated"/>
            )}
            <button
                onClick={() => calibrationModeChanged(device.mac_address, !calibrationMode, room)} disabled={!isDeviceActive(device)}>
                {calibrationMode ? 'Turn Off' : 'Turn On'}
            </button>
        </div>
    );
};

export default DeviceListElement