const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room:    { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  sender:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  type:    { type: String, enum: ['text','image','file','system'], default: 'text' },
  media:   { url: String, filename: String, size: Number, mimeType: String },
  readBy:  [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: { type: Date, default: Date.now } }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  edited:  { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ room: 1, createdAt: -1 });
module.exports = mongoose.model('Message', messageSchema);