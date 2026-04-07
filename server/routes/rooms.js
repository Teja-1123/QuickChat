const express = require('express');
const Room = require('../models/Room');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all rooms for current user
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate('members', 'username avatar status lastSeen')
      .populate('admins', 'username avatar')
      .populate('createdBy', 'username avatar')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username' },
      })
      .sort({ lastActivity: -1 });

    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create group room
router.post('/group', auth, async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name required' });

    const members = [...new Set([req.user._id.toString(), ...(memberIds || [])])];

    const room = new Room({
      name,
      description,
      type: 'group',
      members,
      admins: [req.user._id],
      createdBy: req.user._id,
    });
    await room.save();

    const populated = await Room.findById(room._id)
      .populate('members', 'username avatar status')
      .populate('admins', 'username avatar')
      .populate('createdBy', 'username avatar');

    // System message
    await Message.create({
      room: room._id,
      sender: req.user._id,
      content: `${req.user.username} created the group "${name}"`,
      type: 'system',
    });

    res.status(201).json({ room: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or get private conversation
router.post('/private', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    // Check if private room already exists
    const existingRoom = await Room.findOne({
      type: 'private',
      members: { $all: [req.user._id, userId], $size: 2 },
    })
      .populate('members', 'username avatar status lastSeen')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username' },
      });

    if (existingRoom) return res.json({ room: existingRoom });

    const room = new Room({
      type: 'private',
      members: [req.user._id, userId],
      admins: [req.user._id],
      createdBy: req.user._id,
    });
    await room.save();

    const populated = await Room.findById(room._id).populate(
      'members',
      'username avatar status lastSeen'
    );

    res.status(201).json({ room: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single room
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, members: req.user._id })
      .populate('members', 'username avatar status lastSeen')
      .populate('admins', 'username avatar')
      .populate('createdBy', 'username avatar');

    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to group
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findOne({ _id: req.params.id, admins: req.user._id });
    if (!room) return res.status(403).json({ message: 'Not authorized' });

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    const updated = await Room.findById(room._id).populate('members', 'username avatar status');
    res.json({ room: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave room
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, members: req.user._id });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.members = room.members.filter((m) => m.toString() !== req.user._id.toString());
    room.admins = room.admins.filter((a) => a.toString() !== req.user._id.toString());

    if (room.members.length === 0) {
      await room.deleteOne();
    } else {
      if (room.admins.length === 0 && room.members.length > 0) {
        room.admins.push(room.members[0]);
      }
      await room.save();
    }

    res.json({ message: 'Left room' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;