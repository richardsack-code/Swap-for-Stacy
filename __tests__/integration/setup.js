import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongodb;

// Vor allen Tests: DB starten
beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    const uri = mongodb.getUri();
    await mongoose.connect(uri);
});

// Nach jedem Test: Collections leeren (frischer Zustand)
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// Nach allen Tests: DB stoppen
afterAll(async () => {
    await mongoose.disconnect();
    await mongodb.stop();
});
