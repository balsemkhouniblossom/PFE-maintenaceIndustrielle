require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function hashPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const UserSchema = new mongoose.Schema({
      user_id: String,
      nom_complet: String,
      email: String,
      password: String,
      role: String,
      is_active: Boolean,
      created_at: Date,
    });

    const User = mongoose.model('User', UserSchema);

    const users = await User.find();

    for (const user of users) {
      // Check if password is already hashed
      if (!user.password.startsWith('$2')) {
        console.log(`Hashing password for user: ${user.email}`);
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        await User.updateOne(
          { _id: user._id },
          { password: hashedPassword }
        );
        console.log(`Password hashed for user: ${user.email}`);
      }
    }

    console.log('Password migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

hashPasswords();