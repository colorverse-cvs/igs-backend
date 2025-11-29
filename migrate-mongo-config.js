module.exports = {
  mongodb: {
    url: process.env.MONGO_URI || 'mongodb://admin:root@localhost:27017/giftshop?authSource=admin',
    databaseName: process.env.MONGO_DB || undefined,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  migrationsDir: 'db/migrations',
  changelogCollectionName: 'migrations',
};