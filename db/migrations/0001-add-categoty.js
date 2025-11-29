const NAMES = ['Soft Toys', 'Home Decor', 'Cards', 'Personalized', 'Hampers'];

module.exports = {
  async up(db) {
    const now = new Date();
    for (const name of NAMES) {
      await db.collection('categories').updateOne(
        { name },
        {
          $setOnInsert: {
            name,
            description: '',
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true }
      );
    }
  },

  async down(db) {
    await db.collection('categories').deleteMany({ name: { $in: NAMES } });
  },
};