import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { DeviceInfo, NetworkInfo, PagerPing, PagerAction, PagerTask, ServerResponse } from './defines';
import {connect} from "./db";
import {Db} from "mongodb";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

let db: Db;

async function initDbConnection() {
    db = await connect();
}

initDbConnection().then(() => {
    console.log("Connected to db");
}).catch((error) => {
    console.error("Failed to connect to db:", error);
    console.log("Retrying in 10 seconds...");
    setTimeout(initDbConnection, 10000);
});
//Server will check every minute for state of all devices
const TIMEOUT: number = 60* 1000; //60s
// After how many timeouts device will be deleted from saved devices
const INACTIVE_LIMIT_TIMEOUT: number = 100;

let saved_devices: DeviceInfo[] = [];
let saved_rooms: string[] = [];

let locationMode: boolean = false;

app.get("/", (req: Request, res: Response, next: NextFunction): void => {
    try {
        res.send("index.html");
    } catch (error) {
        next(error);
    }
});

function getDeviceInfo(mac_address: string){
    return saved_devices.find(device => device.getMacAddress() == mac_address);
}

function checkDeviceStatus(mac_address: string){
    let found_device = getDeviceInfo(mac_address);
    if(found_device === undefined){
      saved_devices.push(new DeviceInfo(mac_address))
    }
    else{
        let i = saved_devices.indexOf(found_device);
        saved_devices[i].setActive(true);
        saved_devices[i].resetCounter();
    }
}

app.post("/message", (req: Request, res: Response, next: NextFunction): void => {
try {
        let mac_address: string = req.body.mac_address;
        let message: string = req.body.message;

        let device = getDeviceInfo(mac_address);
        device?.addPendingMessage(
            new PagerTask(PagerAction.DISPLAY, [
                message, //text
                2, //line
                65535, //text color
                0 //bg color
            ])
        );
        console.log("Messege added to queue");
        res.send("Messege added to queue");
    } catch (error) {
        next(error);
    }
});

app.get("/devices", (req: Request, res: Response, next: NextFunction): void => {
    try {
        if(saved_devices.length == 0){
            saved_devices.push(new DeviceInfo("00:00:00:00:00:00"));
        }
        res.send(saved_devices);
    } catch (error) {
        next(error);
    }
});

app.post("/calibration", (req: Request, res: Response, next: NextFunction): void => {
    try {
        let mac_address: string = req.body.mac_address;
        let calibration_mode: boolean = req.body.calibration_mode;
        let room: string = req.body.room;

        if(!(room in saved_rooms)){
            saved_rooms.push(room);
        }

        let device = getDeviceInfo(mac_address);
        device?.setCalibrationMode(calibration_mode);
        device?.setCalibratedRoom(room)
        let message = calibration_mode ? "Online [CAL]: " + room : "Online";
        device?.addPendingMessage(
            new PagerTask(PagerAction.DISPLAY, [
                message, //text
                0, //line
                2016, //text color
                0 //bg color
            ])
        );

        console.log("Calibration mode set to: " + calibration_mode + " for device: " + mac_address + " in room: " + room);
        res.send("Calibration mode set to: " + calibration_mode + " for device: " + mac_address + " in room: " + room);
    } catch (error) {
        next(error);
    }
});

app.post("/location", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let flag: boolean = req.body.locationMode;
        if(locationMode){
            res.send("Location mode already set to: " + flag);
            return;
        }
        try {
            const response = await fetch('/location/mode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ flag }), // send flag in request body
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if(data.trained){
                locationMode = true;
                console.log("Location mode set to: " + flag);
                res.send("Location mode set to: " + flag);
            }
        } catch (error) {
            console.error('Error setting location mode:', error);
        }
    } catch (error) {
        next(error);
    }
});

app.post("/ping", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let mac_address: string = req.body.mac_address;
        let scan_results: NetworkInfo[] = req.body.scan_results;

        checkDeviceStatus(mac_address);

        console.log("Ping received from: " + mac_address);
        let device = getDeviceInfo(mac_address);

        if(device?.getCalibrationMode()){
            db.collection("rooms").findOne({ "name": device?.getCalibratedRoom() }).then((room) => {
                if(room){
                    console.log("Updating room: " + device?.getCalibratedRoom() + " with scan results");
                    db.collection("rooms").updateOne(
                        { "name": device?.getCalibratedRoom() },
                        { $push: { "scan_results": scan_results } } as any
                    );
                }
                else{
                    console.log("Creating new room: " + device?.getCalibratedRoom() + " with scan results");
                    db.collection("rooms").insertOne({ "name": device?.getCalibratedRoom(), "scan_results": [scan_results] });
                }
            });
        }
        else if(locationMode){
            try {
                const response = await fetch('http://mapping:8083/location', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({scan_results})
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const locationName = data.name;
                device?.setLocation(locationName);
            } catch (error) {
                console.error('Error fetching location:', error);
            }
        }

        let pagerTasks: PagerTask[] = [];
        if(device?.getHasPendingMessages()){
            pagerTasks.push(device?.getFirstPendingMessage());
        }
        else{
            pagerTasks.push(new PagerTask(PagerAction.DO_WHATEVER, []));
        }

        res.send(new ServerResponse(pagerTasks));
    } catch (error) {
        next(error);
    }
})

function checkInactiveDevices() {
    console.log("checking all devices")
    for (let i = 0; i < saved_devices.length; i++) {
        if (saved_devices[i].getActive()) {
            saved_devices[i].setActive(false);
            console.log("inactivate: " + saved_devices[i].getMacAddress())
        }
        else if(saved_devices[i].getCounter() < INACTIVE_LIMIT_TIMEOUT){
            saved_devices[i].counterUp();
            console.log("inactive counter for " + saved_devices[i].getMacAddress() + " is " + saved_devices[i].getCounter())
        }
        else{
            saved_devices.splice(i, 1);
            console.log("deleting: " + saved_devices[i].getMacAddress())
        }
    }
}

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)

    setInterval(checkInactiveDevices, 60 * 1000); // Run every minute
})

