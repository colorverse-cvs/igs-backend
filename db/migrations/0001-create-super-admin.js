const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SUPER_ADMIN_ID = new ObjectId("66fbf6f90123456789abc100");

module.exports = {
    async up(db) {
        const email = process.env.SUPER_ADMIN_EMAIL || 'admin@ishitagallery.com';
        const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';

        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const now = new Date();

        // Create super admin user
        const superAdmin = {
            _id: SUPER_ADMIN_ID,
            email: email,
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'admin',
            profile: {
                displayName: 'Super Admin',
                mobile: '',
                gender: '',
                dob: '',
            },
            addresses: [],
            phones: [],
            createdAt: now,
            updatedAt: now,
        };

        // Use updateOne with upsert to avoid duplicate key errors
        await db.collection('users').updateOne(
            { _id: SUPER_ADMIN_ID },
            {
                $setOnInsert: superAdmin,
            },
            { upsert: true }
        );

        console.log('✅ Migration completed: Super admin user created successfully');
        console.log(`   Email: ${email}`);
        console.log(`   Role: admin`);
    },

    async down(db) {
        // Remove the super admin user
        await db.collection('users').deleteOne({ _id: SUPER_ADMIN_ID });
        console.log('🗑️ Migration rollback completed: Super admin user deleted');
    },
};
