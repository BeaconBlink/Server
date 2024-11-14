import express, {NextFunction, Request, Response} from "express";
import path from "path";
import {DeviceInfo, NetworkInfo, PagerAction, PagerTask, ServerResponse} from './defines';
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

let locationMode: boolean = false;

app.get("/", (req: Request, res: Response, next: NextFunction): void => {
    try {
        res.send("index.html");
    } catch (error) {
        next(error);
    }
});

app.post("/test_ping" , async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try{
        let mac_address: string = req.body.mac_address;

        if(collections.devices ==undefined) throw new Error("Database not connected");
        let device = await collections.devices.findOne({ mac_address: mac_address }) as Device;

        if (device){
            const newMessage = new PagerTask(PagerAction.DISPLAY, [
                "I'm " + mac_address, // text
                2, // line
                65535, // text color
                0 // bg color
            ]);
            device.pending_messages.push(newMessage);

            await collections.devices.updateOne(
                { mac_address: mac_address },
                { $set: { pending_messages: device.pending_messages } }
            );
        }

    } catch (error) {
        next(error);
    }
});

app.post("/message", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let mac_address: string = req.body.mac_address;
        let message: string = req.body.message;

        if(collections.devices == undefined) throw new Error("Database not connected");
        let device = await collections.devices.findOne({ mac_address: mac_address }) as Device;

        if (device) {

            const newMessage = new PagerTask(PagerAction.DISPLAY, [
                message, // text
                2, // line
                65535, // text color
                0 // bg color
            ]);
            device.pending_messages.push(newMessage);


            await collections.devices.updateOne(
                { mac_address: mac_address },
                { $set: { pending_messages: device.pending_messages } }
            );

            console.log("Message added to queue");
            res.send("Message added to queue");
        } else {
            res.status(404).send(`Device with mac_address ${mac_address} not found`);
        }
    } catch (error) {
        next(error);
    }
});

app.post("/calibration", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let mac_address: string = req.body.mac_address;
        let calibration_mode: boolean = req.body.calibration_mode;
        let room: string = req.body.room;

        if (collections.devices == undefined) throw new Error("Database not connected");
        let device = await collections.devices.findOne({ mac_address: mac_address }) as Device;

        if (device) {
            device.calibration_mode = calibration_mode;
            device.calibrated_room = room;

            const message = calibration_mode ? "Online [CAL]: " + room : "Online";
            const newMessage = new PagerTask(PagerAction.DISPLAY, [
                message, // text
                0, // line
                2016, // text color
                0 // bg color
            ]);
            device.pending_messages.push(newMessage);

            await collections.devices.updateOne(
                { mac_address: mac_address },
                { $set: { calibration_mode: device.calibration_mode, calibrated_room: device.calibrated_room, pending_messages: device.pending_messages } }
            );

            console.log("Calibration mode set to: " + calibration_mode + " for device: " + mac_address + " in room: " + room);
            res.send("Calibration mode set to: " + calibration_mode + " for device: " + mac_address + " in room: " + room);
        } else {
            res.status(404).send(`Device with mac_address ${mac_address} not found`);
        }
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

        if(collections.devices == undefined || collections.rooms == undefined) throw new Error("Database not connected");
        let device = await collections.devices.findOne({ mac_address: mac_address }) as Device;

        if (device) {
            // Update the last_connected time
            device.last_connected = new Date();
            await collections.devices.updateOne(
                { mac_address: mac_address },
                { $set: { last_connected: device.last_connected } }
            );
            console.log(`Updated last_connected time for device with mac_address ${mac_address}`);

        } else {

            const newDevice = new Device(mac_address, "", new Date(), "", false, "", 100, []);
            await collections.devices.insertOne(newDevice);
            console.log(`Successfully created a new device with mac_address ${mac_address}`);
            device = newDevice;
        }
        console.log("Ping received from: " + mac_address);

        if(device.calibration_mode){

            collections.rooms.findOne({ "name": device.calibrated_room }).then((room) => {
                    console.log("Updating room: " + device.calibrated_room + " with scan results");
                    if(collections.rooms != undefined)
                        collections.rooms.updateOne(
                        { "name": device.calibrated_room },
                        { $push: { "scan_results": scan_results } } as any
                    );
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
                device.location = data.name;
                collections.devices.updateOne({"mac_address": mac_address}, {$set: {"location": device.location}});
            } catch (error) {
                console.error('Error fetching location:', error);
            }
        }

        let pagerTasks: PagerTask[] = [];
        if(device.pending_messages.length > 0){
            pagerTasks.push(device.pending_messages.shift() as PagerTask);
            await collections.devices.updateOne(
                { mac_address: mac_address },
                { $set: { pending_messages: device.pending_messages } }
            );
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

