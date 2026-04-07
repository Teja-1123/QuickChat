const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { v4 }  = require('uuid');
const auth    = require('../middleware/auth');
const router  = express.Router();

const dir = path.join(__dirname, '../uploads');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename:    (_req, file, cb) => cb(null, `${v4()}${path.extname(file.originalname)}`),
});

const allowed = ['image/jpeg','image/png','image/gif','image/webp','application/pdf',
  'text/plain','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip'];

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Type not allowed')),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

router.post('/', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  res.json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
    type: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
  });
});

module.exports = router;


