import { ObjectId } from "mongodb";
import {NetworkInfo} from "../defines";

export default class Game {
    constructor(public name: string,
                public callibrated: boolean,
                public last_callibration: Date,
                public tags: string[],
                public scan_results: NetworkInfo[],
                public id?: ObjectId) {}
}