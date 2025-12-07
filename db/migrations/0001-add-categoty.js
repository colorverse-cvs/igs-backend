const { ObjectId } = require('mongodb');

const SEED_CATEGORIES = [
  { _id: new ObjectId("66fbf6f90123456789abc001"), name: "Soft Toys" },
  { _id: new ObjectId("66fbf6f90123456789abc002"), name: "Home Decor" },
  { _id: new ObjectId("66fbf6f90123456789abc003"), name: "Cards" },
  { _id: new ObjectId("66fbf6f90123456789abc004"), name: "Personalized" },
  { _id: new ObjectId("66fbf6f90123456789abc005"), name: "Hampers" },
];

module.exports = {
  async up(db) {
    const now = new Date();

    for (const cat of SEED_CATEGORIES) {
      await db.collection('categories').updateOne(
        { _id: cat._id },
        {
          $setOnInsert: {
            _id: cat._id,
            name: cat.name,
            description: '',
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true }
      );
    }
    console.log("✅ Migration completed: Categories seed inserted/updated successfully");
  },

  async down(db) {
    const ids = SEED_CATEGORIES.map(c => c._id);
    await db.collection('categories').deleteMany({ _id: { $in: ids } });
    console.log("🗑️ Migration rollback completed: Categories deleted");
  },
};
