require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require("mongoose");
const path = require('path');


const authRoutes    = require('./routes/auth');
const roomRoutes    = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const uploadRoutes  = require('./routes/upload');
const { setupSocket } = require('./socket/socketHandler');

const app    = express();
app.use(express.json());
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

/* ── Middleware ─────────────────────────────────────────────────── */
app.use(cors({ origin: "https://quick-chat-brown.vercel.app/",
  credentials: true
 }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ── REST Routes ────────────────────────────────────────────────── */
app.use('/api/auth',     authRoutes);
app.use('/api/rooms',    roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload',   uploadRoutes);
app.get('/api/health',   (_req, res) => res.json({ ok: true }));

/* ── WebSocket ──────────────────────────────────────────────────── */
setupSocket(io);
console.log("MONGO_URI:", process.env.MONGO_URI);


/* ── Database + Start ───────────────────────────────────────────── */
mongoose
  mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });