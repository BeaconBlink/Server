import express, { Request, Response, NextFunction } from "express";
import path from "path";
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req: Request, res: Response, next: NextFunction): void => {
    try {
        res.send("index.html");
    } catch (error) {
        next(error);
    }
});

app.get("/ping", (req: Request, res: Response, next: NextFunction): void => {
    try {
        let mac_address: string = req.body.mac_address;
        let scan_results: NetworkInfo[] = req.body.scan_results;

        console.log("Ping received from: " + mac_address);
        console.log("Scan results: ");
        for (let i = 0; i < scan_results.length; i++) {
            console.log(scan_results[i].ssid + " | " + scan_results[i].rssi + "dBm" + " | " + scan_results[i].bssid)
        }

        res.send(new ServerResponse([new PagerTask(PagerAction.DO_WHATEVER, [])]));
    } catch (error) {
        next(error);
    }
})



app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})