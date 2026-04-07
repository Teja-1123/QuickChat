const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

// Track online users: userId -> socketId
const onlineUsers = new Map();

const setupSocket = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🔌 ${socket.user.username} connected`);

    // Register user as online
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { status: 'online' });
    io.emit('user:status', { userId, status: 'online' });

    // Join all user rooms
    const rooms = await Room.find({ members: userId });
    rooms.forEach((room) => socket.join(room._id.toString()));

    // Emit online users list
    socket.emit('users:online', Array.from(onlineUsers.keys()));

    // ─── Send Message ───────────────────────────────────────────────
    socket.on('message:send', async (data) => {
      try {
        const { roomId, content, type = 'text', media, replyTo } = data;

        const room = await Room.findOne({ _id: roomId, members: userId });
        if (!room) return socket.emit('error', { message: 'Not authorized' });

        const message = new Message({
          room: roomId,
          sender: userId,
          content: content || '',
          type,
          media,
          replyTo: replyTo || null,
        });
        await message.save();

        await message.populate('sender', 'username avatar');
        if (replyTo) await message.populate('replyTo');

        // Update room last activity
        await Room.findByIdAndUpdate(roomId, {
          lastMessage: message._id,
          lastActivity: new Date(),
        });

        io.to(roomId).emit('message:new', { message, roomId });
      } catch (err) {
        console.error('message:send error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── Typing Indicators ──────────────────────────────────────────
    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:start', {
        userId,
        username: socket.user.username,
        roomId,
      });
    });

    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:stop', { userId, roomId });
    });

    // ─── Mark Messages Read ─────────────────────────────────────────
    socket.on('messages:read', async ({ roomId }) => {
      try {
        await Message.updateMany(
          { room: roomId, 'readBy.user': { $ne: userId } },
          { $push: { readBy: { user: userId, readAt: new Date() } } }
        );
        socket.to(roomId).emit('messages:read', { userId, roomId });
      } catch (err) {
        console.error('messages:read error:', err);
      }
    });

    // ─── Delete Message ─────────────────────────────────────────────
    socket.on('message:delete', async ({ messageId, roomId }) => {
      try {
        const message = await Message.findOne({ _id: messageId, sender: userId });
        if (!message) return;

        message.deleted = true;
        message.content = 'This message was deleted';
        message.media = undefined;
        await message.save();

        io.to(roomId).emit('message:deleted', { messageId, roomId });
      } catch (err) {
        console.error('message:delete error:', err);
      }
    });

    // ─── Join New Room ──────────────────────────────────────────────
    socket.on('room:join', ({ roomId }) => {
      socket.join(roomId);
    });

    // ─── Disconnect ─────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔌 ${socket.user.username} disconnected`);
      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        lastSeen: new Date(),
      });

      io.emit('user:status', { userId, status: 'offline', lastSeen: new Date() });
    });
  });
};

module.exports = { setupSocket, onlineUsers };