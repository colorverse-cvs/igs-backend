const migrateMongo = require('migrate-mongo');

async function run() {
  try {
    const { db, client } = await migrateMongo.database.connect();
    const migrated = await migrateMongo.up(db, client);
    console.log('Migrations applied:', migrated);
    await client.close();
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}

run();