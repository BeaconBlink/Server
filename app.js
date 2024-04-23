const express = require('express');
const {NetworkInfo, PagerPing, PagerTask, PagerAction, ServerResponse} = require("./defines.js");
const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/ping", (req, res) => {
    console.log(req.body.pager_ping);
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
