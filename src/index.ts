import express, { Request, Response, NextFunction } from "express";
import path from "path";
import {DeviceInfo, NetworkInfo, PagerPing, PagerAction, PagerTask, ServerResponse } from './defines';
import {collections, connect} from "./services/database.service";
import {devicesRouter} from "./routes/devices.router";
import Device from "./model/device";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

async function initDbConnection() {
    await connect();
}

initDbConnection().then(() => {
    console.log("Connected to db");
}).catch((error) => {
    console.error("Failed to connect to db:", error);
    console.log("Retrying in 10 seconds...");
    setTimeout(initDbConnection, 10000);
});
app.use("/devices", devicesRouter);
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
            const response = await fetch('http://mapping:8083/location/mode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({mode: flag}), // send flag in request body
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

            // Create a new Device object
            const newDevice = new Device(mac_address, "", new Date(), "", false, "", 100, []);

            try {
                const response = await fetch('http://localhost:8080/devices/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newDevice),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                console.log(`Successfully created a new device with mac_address ${mac_address}`);
            } catch (error) {
                console.error('Error creating new device:', error);
            }

        console.log("Ping received from: " + mac_address);
        let device = getDeviceInfo(mac_address);

        if(device?.getCalibrationMode()){

            // @ts-ignore
            collections.rooms.findOne({ "name": device?.getCalibratedRoom() }).then((room) => {
                if(room){
                    console.log("Updating room: " + device?.getCalibratedRoom() + " with scan results");
                    // @ts-ignore
                    collections.rooms.updateOne(
                        { "name": device?.getCalibratedRoom() },
                        { $push: { "scan_results": scan_results } } as any
                    );
                }
                else{
                    console.log("Creating new room: " + device?.getCalibratedRoom() + " with scan results");
                    // @ts-ignore
                    collections.rooms.insertOne({ "name": device?.getCalibratedRoom(), "scan_results": [scan_results] });
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

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})

