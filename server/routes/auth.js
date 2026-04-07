const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const auth    = require('../middleware/auth');
const router  = express.Router();

const sign = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    console.log("BODY 👉", req.body);
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (await User.findOne({ $or: [{ email }, { username }] }))
      return res.status(400).json({ message: 'Username or email already taken' });
    const user = await new User({ username, email, password }).save();
    res.status(201).json({ token: sign(user._id), user });
  } catch (e) { 
    console.error("REGISTER ERROR 👉", e);
    res.status(500).json({ message: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ message: 'Invalid credentials' });
    user.status = 'online'; await user.save();
    res.json({ token: sign(user._id), user });
  } catch (e) { console.error("REGISTER ERROR 👉", e);
    res.status(500).json({ message: e.message }); }
});

router.get('/me', auth, (req, res) => res.json({ user: req.user }));

router.put('/profile', auth, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const up = {};
    if (username) up.username = username;
    if (avatar !== undefined) up.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.user._id, up, { new: true, runValidators: true }).select('-password');
    res.json({ user });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/users/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ username: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }],
    }).select('-password').limit(10);
    res.json({ users });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
