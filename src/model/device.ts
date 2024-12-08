import {ObjectId} from "mongodb";
import {BatteryInfo, PagerTask} from "../defines";

export default class Device {
    constructor(public mac_address: string,
    public alias: string,
    public last_connected: Date,
    public calibration_mode: boolean,
    public battery_level: number,
    public pending_messages: PagerTask[],
    public battery_infos: BatteryInfo[],
    public calibrated_room?: ObjectId,
    public location?: ObjectId,
    public _id?: ObjectId) {}
}