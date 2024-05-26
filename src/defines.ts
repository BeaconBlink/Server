//Server only defines

export class DeviceInfo{
    private mac_address: string;
    private active: boolean;
    private pending_massages: PagerTask[];
    private inactive_counter: number;


    constructor(mac_address: string) {
        this.mac_address = mac_address;
        this.active  = true;
        this.pending_massages = [];
        this.inactive_counter = 0;
    }

    getMacAddress(): string{
        return this.mac_address;
    }

    setActive(flag: boolean): void{
        this.active = flag;
    }

    getActive(): boolean{
        return this.active;
    }

    getHasPendingMesseges(): boolean{
        return this.pending_massages.length != 0;
    }

    resetCounter(): void{
        this.inactive_counter = 0;
    }

    counterUp(): void{
        this.inactive_counter += 1;
    }

    getCounter(): number{
        return this.inactive_counter;
    }

    getLastPendingMessege(): PagerTask {
        return this.pending_massages.pop();
    }

    addPendingMessege(task: PagerTask): void{
        this.pending_massages.push(task);
    }

    clearPendingMesseges(): void{
        this.pending_massages = [];
    }
}


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
    DO_WHATEVER= "whatever",
    SUMMON = "summon",
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
