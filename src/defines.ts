//Server only defines

export class DeviceInfo{
    public mac_address: string;
    public active: boolean;
    public pending_massages: PagerTask[];
    public inactive_counter: number;
    public calibrationMode: boolean;
    public calibratedRoom: string;


    constructor(mac_address: string) {
        this.mac_address = mac_address;
        this.active  = true;
        this.pending_massages = [];
        this.inactive_counter = 0;
        this.calibrationMode = false;
        this.calibratedRoom = "";
    }

    setCalibrationMode(flag: boolean): void{
        this.calibrationMode = flag;
    }

    setCalibratedRoom(room: string): void{
        this.calibratedRoom = room;
    }

    getCalibrationMode(): boolean{
        return this.calibrationMode;
    }

    getCalibratedRoom(): string{
        return this.calibratedRoom;
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

    getHasPendingMessages(): boolean{
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

    getLastPendingMessage(): PagerTask {
        return <PagerTask> this.pending_massages.pop();
    }

    getFirstPendingMessage(): PagerTask {
        return <PagerTask> this.pending_massages.shift()
    }

    addPendingMessage(task: PagerTask): void{
        this.pending_massages.push(task);
    }

    clearPendingMessages(): void{
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
