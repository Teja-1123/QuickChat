const express = require('express');
const Message = require('../models/Message');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

const router = express.Router();

// Get messages for a room (paginated)
router.get('/:roomId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const room = await Room.findOne({ _id: req.params.roomId, members: req.user._id });
    if (!room) return res.status(403).json({ message: 'Not authorized' });

    const skip = (page - 1) * limit;
    const messages = await Message.find({ room: req.params.roomId, deleted: false })
      .populate('sender', 'username avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({ room: req.params.roomId, deleted: false });

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        hasMore: skip + messages.length < total,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.post('/:roomId/read', auth, async (req, res) => {
  try {
    await Message.updateMany(
      {
        room: req.params.roomId,
        'readBy.user': { $ne: req.user._id },
      },
      {
        $push: { readBy: { user: req.user._id, readAt: new Date() } },
      }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: req.user._id,
    });

    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.deleted = true;
    message.content = 'This message was deleted';
    await message.save();

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;