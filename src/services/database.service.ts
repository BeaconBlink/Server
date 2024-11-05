import { MongoClient, Collection } from 'mongodb';

export const collections: {
    rooms?: Collection,
    devices?: Collection
} = {}

export async function connect(){
    const client = new MongoClient('mongodb://root:example@mongo:27017/beacon_blink?authSource=admin');
    await client.connect();
    const db = client.db('beacon_blink');

    const collectionsList = await db.listCollections().toArray();
    const collectionNames = collectionsList.map(col => col.name);

    if (!collectionNames.includes('rooms')) {
        await db.createCollection('rooms');
    }

    if (!collectionNames.includes('devices')) {
        await db.createCollection('devices');
    }

    collections.rooms = db.collection('rooms');
    collections.devices = db.collection('devices');
}
