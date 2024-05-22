import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { DeviceInfo, NetworkInfo, PagerPing, PagerAction, PagerTask, ServerResponse } from './defines';
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

//Server will check every minute for state of all devices
const TIMEOUT: number = 60* 1000; //60s
// After how many timeouts device will be deleted from saved devices
const INACTIVE_LIMIT_TIMEOUT: number = 100;

let saved_devices: DeviceInfo[] = [];

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

app.post("/ping", (req: Request, res: Response, next: NextFunction): void => {
    try {
        let mac_address: string = req.body.mac_address;
        let scan_results: NetworkInfo[] = req.body.scan_results;

        checkDeviceStatus(mac_address);

        console.log("Ping received from: " + mac_address);
        // console.log("Scan results: ");
        // for (let i = 0; i < scan_results.length; i++) {
        //     console.log(scan_results[i].ssid + " | " + scan_results[i].rssi + "dBm" + " | " + scan_results[i].bssid)
        // }
        let device = getDeviceInfo(mac_address);

        if(device?.getHasPendingMesseges()){
            res.send(new ServerResponse(device?.getPendingMesseges()));
        }
        else{
            res.send(new ServerResponse([new PagerTask(PagerAction.DO_WHATEVER, [])]));
        }
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

