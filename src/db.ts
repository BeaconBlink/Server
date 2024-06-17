import { MongoClient, Db } from 'mongodb';

async function connect(): Promise<Db> {
    const client = new MongoClient('mongodb://root:example@mongo:27017/beacon_blink?authSource=admin');
    await client.connect();
    let db = client.db('beacon_blink');
    return db;
}

export { connect };