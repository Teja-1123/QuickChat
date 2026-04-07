const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name:        { type: String, trim: true, maxlength: 60 },
  description: { type: String, default: '', maxlength: 200 },
  type:        { type: String, enum: ['group', 'private'], required: true },
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastActivity:{ type: Date, default: Date.now },
}, { timestamps: true });

roomSchema.index({ members: 1 });
module.exports = mongoose.model('Room', roomSchema);