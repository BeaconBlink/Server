import {ObjectId} from "mongodb";
import {PagerTask} from "../defines";

export default class Device {
    constructor(public mac_address: string,
    public alias: string,
    public last_connected: Date,
    public location: string,
    public calibration_mode: boolean,
    public calibrated_room: string,
    public battery_level: number,
    public pending_messages: PagerTask[],
    public _id?: ObjectId) {}
}