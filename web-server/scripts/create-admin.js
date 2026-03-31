const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../schemas/User.schema');
const { USER_ROLES } = require('../config/constants');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const createAdmin = async () => {
  try {
    if (!MONGO_URI) {
      console.error('MONGO_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB...');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists. Updating information...');
      
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(adminPassword, salt);

      existingAdmin.password_hash = password_hash;
      existingAdmin.role = USER_ROLES.ADMIN;
      existingAdmin.full_name = 'Admin';
      existingAdmin.phone = '0987654321';
      existingAdmin.address = 'Microsoft Google';
      
      await existingAdmin.save();
      console.log('✅ Admin user updated successfully.');
    } else {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(adminPassword, salt);

      const adminUser = new User({
        email: adminEmail,
        password_hash,
        role: USER_ROLES.ADMIN,
        full_name: 'Admin',
        phone: '0987654321',
        address: 'Microsoft Google',
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
