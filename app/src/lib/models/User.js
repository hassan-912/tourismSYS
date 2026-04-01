import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'Tourism',
    enum: [
      'Employee', 'Review Team', 'Moderator', 'Admin', 'admin', 'sub-admin', 'employee',
      'Tourism', 'MG+', 'Review', 'moderator', 'jobseeker', 'study', 'immigration'
    ], // Keeping old ones for backward compatibility
  },
  order: {
    type: Number,
    default: 0
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
