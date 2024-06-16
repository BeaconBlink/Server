import { MongoClient, Db } from 'mongodb';

async function connect(): Promise<Db> {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    let db = client.db('beacon_blink');
    return db;
}

export { connect};