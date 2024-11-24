import express, {Request, Response} from "express";
import Room from "../model/room";
import {collections} from "../services/database.service";
import Device from "../model/device";
import {devicesRouter} from "./devices.router";
import {ObjectId} from "mongodb";

export const roomsRouter = express.Router();
roomsRouter.use(express.json());

roomsRouter.get("/", async (_req: Request, res: Response) => {
    try {
        // @ts-ignore
        const rooms = (await collections.rooms.find({}).toArray()) as Room[];

        res.status(200).send(rooms);
    } catch (error : any) {
        res.status(500).send(error.message);
    }
});

roomsRouter.get("/tags", async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const tags = (await collections.rooms.distinct("tags")) as string[];

        res.status(200).send(tags);
    } catch (error : any) {
        res.status(500).send(error.message);
    }
});

roomsRouter.get("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;
    try {
        // @ts-ignore
        const room = await collections.rooms.findOne({ _id :new ObjectId(id) }) as Room;

        if (room) {
            res.status(200).send(room);
        }
        else{
            res.status(404).send(`Unable to find room with matching id: ${req.params.id}`);
        }
    } catch (error) {
        res.status(404).send(`Unable to find room with matching id: ${req.params.id}`);
    }
});

roomsRouter.post("/", async (req: Request, res: Response) => {
    try {
        const newRoom = req.body as Room;
        const query = { name: newRoom.name };

        // Check if a device with the given mac_address already exists
        // @ts-ignore
        const existingRoom = await collections.rooms.findOne(query);

        if (existingRoom) {
            res.status(409).send(`Room with name ${newRoom.name} already exists.`);
        } else {
            // @ts-ignore
            const result = await collections.rooms.insertOne(newRoom);
            result
                ? res.status(201).send(`Successfully created a new room with id ${result.insertedId}`)
                : res.status(500).send("Failed to create a new room.");
        }
    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

roomsRouter.put("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    if (collections.rooms == undefined || collections.devices == undefined) throw new Error("Database not connected");

    try {
        const updatedRoom: Room = req.body as Room;
        const query = { _id: new ObjectId(id) };


        // @ts-ignore
        const result = await collections.rooms.updateOne(query, { $set: updatedRoom });


        result
            ? res.status(200).send(`Successfully updated room with id ${id}`)
            : res.status(304).send(`Room with id: ${id} not updated`);
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

roomsRouter.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {
        const query = { _id: new ObjectId(id) };
        // @ts-ignore
        const result = await collections.rooms.deleteOne(query);

        const deviceQuery = { location: new ObjectId(id) };
        // @ts-ignore
        await collections.devices.updateMany(deviceQuery, { $set: { location: null}});

        const calibratedQuery = { calibrated_room: new ObjectId(id) };
        // @ts-ignore
        await collections.devices.updateMany(calibratedQuery, { $set: { calibrated_room: null, calibration_mode: false}});

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed room with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove room with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Room with id ${id} does not exist`);
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});