import mongoose from 'mongoose';
import User from './src/models/User.js';
import Project from './src/models/Project.js';
import Task from './src/models/Task.js';
import Contract from './src/models/Contract.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/team-task-manager';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const args = process.argv.slice(2);
    const cmd = args[0];

    if (cmd === '--clear') {
      console.log('Clearing all collections...');
      await User.deleteMany({});
      await Project.deleteMany({});
      await Task.deleteMany({});
      await Contract.deleteMany({});
      console.log('Database cleared successfully! You can now register a new account on http://localhost:5173, and it will automatically be made an Admin.');
    } else if (cmd === '--promote' && args[1]) {
      const email = args[1].toLowerCase().trim();
      console.log(`Attempting to promote user: ${email} to admin...`);
      const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
      if (user) {
        console.log(`Success! User ${user.name} (${user.email}) has been promoted to: ${user.role}`);
      } else {
        console.log(`Error: User with email "${email}" not found.`);
      }
    } else {
      console.log('\n--- Current Users in Database ---');
      const users = await User.find({});
      if (users.length === 0) {
        console.log('No users found in database.');
      } else {
        users.forEach((u, i) => {
          console.log(`${i + 1}. Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
        });
      }

      console.log('\n--- Usage Guide ---');
      console.log('1. List users:');
      console.log('   node reset-db.js');
      console.log('2. Promote an existing user to admin:');
      console.log('   node reset-db.js --promote your-email@example.com');
      console.log('3. Delete all users/data (start fresh):');
      console.log('   node reset-db.js --clear');
    }
  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

run();
