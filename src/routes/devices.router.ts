import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import Device from "../model/device";

export const devicesRouter = express.Router();
devicesRouter.use(express.json());

devicesRouter.get("/", async (_req: Request, res: Response) => {
    try {
        // @ts-ignore
        const devices = (await collections.devices.find({}).toArray()) as unknown as Device[];

        res.status(200).send(devices);
    } catch (error : any) {
        res.status(500).send(error.message);
    }
});

devicesRouter.post("/located", async (_req: Request, res: Response) => {
    const roomId = _req.body.roomId;

    if(collections.devices ==undefined) throw new Error("Database not connected");

    try{
        const devices = await collections.devices.find({ location: new ObjectId(roomId) }).toArray();

        if(devices) {
            res.status(200).send(devices);
        }
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

devicesRouter.post("/calibrating", async (_req: Request, res: Response) => {
    const roomId = _req.body.roomId;

    if(collections.devices ==undefined) throw new Error("Database not connected");
    try{
        const devices = await collections.devices.find({ calibrated_room: new ObjectId(roomId), calibration_mode: true}).toArray();

        if(devices) {
            res.status(200).send(devices);
        }
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

devicesRouter.get("/:mac_address", async (req: Request, res: Response) => {
    const mac_address = req?.params?.mac_address;

    try {
        // @ts-ignore
        const device = await collections.devices.findOne({ mac_address : mac_address }) as Device;

        if (device) {
            res.status(200).send(device);
        }
    } catch (error) {
        res.status(404).send(`Unable to find device with matching mac_address: ${req.params.mac_address}`);
    }
});

devicesRouter.post("/", async (req: Request, res: Response) => {
    try {
        const newDevice = req.body as Device;
        const query = { mac_address: newDevice.mac_address };

        // Check if a device with the given mac_address already exists
        // @ts-ignore
        const existingDevice = await collections.devices.findOne(query);

        if (existingDevice) {
            res.status(409).send(`Device with mac_address ${newDevice.mac_address} already exists.`);
        } else {
            // @ts-ignore
            const result = await collections.devices.insertOne(newDevice);
            result
                ? res.status(201).send(`Successfully created a new device with id ${result.insertedId}`)
                : res.status(500).send("Failed to create a new device.");
        }
    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

devicesRouter.put("/:mac_address", async (req: Request, res: Response) => {
    const mac_address = req?.params?.mac_address;

    try {
        const updatedDevice: Device = req.body as Device;
        const query = { mac_address: mac_address };

        // @ts-ignore
        const result = await collections.devices.updateOne(query, { $set: updatedDevice });

        result
            ? res.status(200).send(`Successfully updated device with mac_address ${mac_address}`)
            : res.status(304).send(`Device with mac_address: ${mac_address} not updated`);
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

devicesRouter.delete("/:mac_address", async (req: Request, res: Response) => {
    const mac_address = req?.params?.mac_address;

    try {
        const query = { mac_address: mac_address };
        // @ts-ignore
        const result = await collections.devices.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed device with mac_address ${mac_address}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove device with mac_address ${mac_address}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Device with mac_address ${mac_address} does not exist`);
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});