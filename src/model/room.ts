import { ObjectId } from "mongodb";
import {NetworkInfo} from "../defines";

export default class Room {
    constructor(public name: string,
                public calibrated: boolean,
                public tags: string[],
                public scan_results: NetworkInfo[],
                public last_calibration?: Date,
                public _id?: ObjectId) {}
}