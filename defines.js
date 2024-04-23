class NetworkInfo {
    ssid; //str
    rssi; //int
    bssid; //str

    constructor(ssid, rssi, bssid) {
        this.ssid = ssid;
        this.rssi = rssi;
        this.bssid = bssid;
    }
}

class PagerPing {
    mac_address; //str
    scan_results; //List<NetworkInfo>

    constructor(mac_address, scan_results = null) {
        this.mac_address = mac_address;
        this.scan_results = scan_results;
    }
}

const PagerAction = {
    DO_WHATEVER: "whatever"
}

class PagerTask {
    action; //PagerAction
    args; //List<str>

    constructor(action, args) {
        this.action = action;
        this.args = args;
    }
}

class ServerResponse {
    tasks; //List<PagerTask>

    constructor(tasks) {
        this.tasks = tasks;
    }
}

module.exports = { NetworkInfo, PagerPing, PagerTask, PagerAction, ServerResponse };