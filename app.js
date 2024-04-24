const express = require('express');
const {NetworkInfo, PagerPing, PagerTask, PagerAction, ServerResponse} = require("./defines.js");
const app = express();
const PORT = 8080;

app.use(express.json());

app.post("/ping", (req, res) => {
    mac_address = req.body.mac_address;
    scan_results = req.body.scan_results;

    console.log("Ping received from: " + mac_address);
    console.log("Scan results: ");
    for (let i = 0; i < scan_results.length; i++) {
        console.log(scan_results[i].ssid + " | " + scan_results[i].rssi + "dBm" + " | " + scan_results[i].bssid)
    }

    res.send(new ServerResponse([new PagerTask(PagerAction.DO_WHATEVER, [])]));
});

app.get('/', (req, res) => {
    res.send('Hello from our server!')
})


app.listen(PORT, (error) =>{
        if(!error)
            console.log("Server is Successfully Running and App is listening on port "+ PORT)
    else
        console.log("Error occurred, server can't start", error);
    }
);
