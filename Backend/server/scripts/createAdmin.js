// Major-/Backend/servers/scripts/createAdmin.js
// Script to create the initial admin account
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://luckyak619_db_user:luckyak619@cluster0.lcmjwhw.mongodb.net/inventroops?retryWrites=true&w=majority';

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, default: 'system' }
});

const Admin = mongoose.model('Admin', adminSchema);

// Create readline interface for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisified question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
  try {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║     InventroOps Admin Account Creator           ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // Connect to MongoDB
    console.log(' Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log(' Connected to MongoDB\n');

    // Check if any admin exists
    const existingAdminCount = await Admin.countDocuments();
    if (existingAdminCount > 0) {
      console.log(`  Warning: ${existingAdminCount} admin account(s) already exist in the database.`);
      const proceed = await question('Do you want to create another admin? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
        console.log(' Admin creation cancelled.');
        rl.close();
        process.exit(0);
      }
      console.log();
    }

    // Get admin details
    console.log('Please enter the admin details:\n');
    
    const name = await question('Full Name: ');
    if (!name.trim()) {
      throw new Error('Name is required');
    }

    const username = await question('Username: ');
    if (!username.trim()) {
      throw new Error('Username is required');
    }

    const email = await question('Email: ');
    if (!email.trim() || !email.includes('@')) {
      throw new Error('Valid email is required');
    }

    // Password input (hidden for security)
    console.log('\nPassword requirements:');
    console.log('  • Minimum 8 characters');
    console.log('  • Recommended: Use a mix of letters, numbers, and symbols\n');
    
    const password = await question('Password: ');
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const confirmPassword = await question('Confirm Password: ');
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    console.log('\n Creating admin account...');

    // Check if username or email already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      throw new Error('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = new Admin({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: 'admin',
      isActive: true,
      createdBy: 'system'
    });

    await admin.save();

    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║            Admin Account Created!               ║');
    console.log('╚══════════════════════════════════════════════════╝\n');
    console.log('Admin Details:');
    console.log('─────────────────────────────────────────────────');
    console.log(`Name:     ${admin.name}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Role:     ${admin.role}`);
    console.log(`ID:       ${admin._id}`);
    console.log('─────────────────────────────────────────────────\n');
    console.log('  IMPORTANT: Save these credentials securely!');
    console.log(' You can now login to the system using these credentials.\n');

    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n Error creating admin:', error.message);
    rl.close();
    process.exit(1);
  }
};

// Run the script
createAdmin();