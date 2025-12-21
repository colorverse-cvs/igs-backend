require('dotenv').config();
module.exports = {
  mongodb: {
    url: process.env.MONGO_URI || 'mongodb://localhost:27017/giftshop?authSource=admin',
    databaseName: process.env.MONGO_DB || 'giftshop',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  migrationsDir: 'db/migrations',
  changelogCollectionName: 'migrations',
};