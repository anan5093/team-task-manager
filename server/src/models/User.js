import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    aiPreferences: {
      enableInsights: { type: Boolean, default: true },
      autoRecommend: { type: Boolean, default: true },
      reportFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' }
    },
    skills: [String],
    contractAccessLevel: { 
      type: String, 
      enum: ['none', 'public', 'public+internal', 'all'],
      default: 'public'
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.matchPassword = function matchPassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
