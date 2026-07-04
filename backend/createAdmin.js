// Creates a new admin user, or promotes an existing user (by email) to admin.
//
// Usage:
//   node createAdmin.js <email> <password> [name]
//
// Examples:
//   node createAdmin.js admin@learnhub.com Admin@12345 "Site Admin"
//   node createAdmin.js existingstudent@gmail.com anything
//     (if the email already exists, password/name are ignored — the
//      existing account is simply promoted to admin)
//
// Safe to delete this file afterward — it's not part of the running app.
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const run = async () => {
  const [, , email, password, name] = process.argv;

  if (!email) {
    console.log('Usage: node createAdmin.js <email> <password> [name]');
    process.exit(1);
  }

  try {
    await connectDB();

    let user = await User.findOne({ email });

    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`✅ Existing user promoted to admin: ${email}`);
    } else {
      if (!password) {
        console.log('No account with that email exists yet — a password is required to create one.');
        console.log('Usage: node createAdmin.js <email> <password> [name]');
        process.exit(1);
      }
      user = await User.create({
        name: name || 'Admin',
        email,
        password,
        role: 'admin',
      });
      console.log(`✅ New admin account created: ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

run();