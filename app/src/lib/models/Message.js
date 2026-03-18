import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  senderRole: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  readBy: [{
    type: String,
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
