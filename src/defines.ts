//Server and Pager side defines
export class NetworkInfo {
    ssid: string;
    rssi: number;
    bssid: string;

    constructor(ssid: string, rssi: number, bssid: string) {
        this.ssid = ssid;
        this.rssi = rssi;
        this.bssid = bssid;
    }
}

export class PagerPing {
    mac_address: string;
    scan_results: NetworkInfo[];

    constructor(mac_address: string, scan_results: NetworkInfo[]) {
        this.mac_address = mac_address;
        this.scan_results = scan_results;
    }
}

export enum PagerAction {
    DISPLAY = "display"
}

export class PagerTask {
    action: PagerAction;
    args: (string|number)[];

    constructor(action: PagerAction, args: (string | number)[]) {
        this.action = action;
        this.args = args;
    }
}

export class ServerResponse {
    tasks: PagerTask[];

    constructor(tasks: PagerTask[]) {
        this.tasks = tasks;
    }
}
