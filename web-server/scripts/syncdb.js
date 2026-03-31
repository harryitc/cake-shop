const { MongoClient } = require('mongodb');
require('dotenv').config();

const ATLAS_URI = "mongodb+srv://harryitcdev_db_user:Vi6tI6DqqttX3ggB@cluster0harryitc.s2wpikm.mongodb.net/cake-shop?appName=Cluster0Harryitc";
const LOCAL_URI = "mongodb://localhost:27017/cake-shop";

async function syncDB() {
    const atlasClient = new MongoClient(ATLAS_URI);
    const localClient = new MongoClient(LOCAL_URI);

    try {
        console.log('Connecting to Atlas and Local MongoDB...');
        await atlasClient.connect();
        await localClient.connect();
        console.log('Connected successfully to both servers');

        const atlasDb = atlasClient.db();
        const localDb = localClient.db();

        const collections = await atlasDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections to sync`);

        for (const collInfo of collections) {
            const collName = collInfo.name;
            console.log(`- Syncing collection: ${collName}`);

            // Clear local collection first
            await localDb.collection(collName).deleteMany({});

            // Copy all documents
            const cursor = atlasDb.collection(collName).find({});
            const documents = await cursor.toArray();

            if (documents.length > 0) {
                await localDb.collection(collName).insertMany(documents);
                console.log(`  Done: ${documents.length} docs copied`);
            } else {
                console.log(`  Skipping: collection is empty`);
            }
        }

        console.log('--- Database Sync Completed Successfully ---');
    } catch (err) {
        console.error('Error during sync:', err);
    } finally {
        await atlasClient.close();
        await localClient.close();
    }
}

syncDB();