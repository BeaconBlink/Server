class NetworkInfo {
    ssid: string;
    rssi: number;
    bssid: string;

    constructor(ssid: string, rssi: number, bssid: string) {
        this.ssid = ssid;
        this.rssi = rssi;
        this.bssid = bssid;
    }
}

class PagerPing {
    mac_address: string;
    scan_results: NetworkInfo[];

    constructor(mac_address: string, scan_results: NetworkInfo[]) {
        this.mac_address = mac_address;
        this.scan_results = scan_results;
    }
}

enum PagerAction {
    DO_WHATEVER= "whatever"
}

class PagerTask {
    action: PagerAction;
    args: string[];

    constructor(action: PagerAction, args: string[]) {
        this.action = action;
        this.args = args;
    }
}

class ServerResponse {
    tasks: PagerTask[];

    constructor(tasks: PagerTask[]) {
        this.tasks = tasks;
    }
}

module.exports = { NetworkInfo, PagerPing, PagerTask, PagerAction, ServerResponse };