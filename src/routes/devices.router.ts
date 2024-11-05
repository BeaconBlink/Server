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
    } catch (error) {
        // @ts-ignore
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
    } catch (error) {
        console.error(error);
        // @ts-ignore
        res.status(400).send(error.message);
    }
});