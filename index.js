const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();
const os = require('os');
const path = require('path');
const fs = require('fs');

const multer = require('multer');

// ----------- Video-LLaMA Client -----------
const { analyzeVideoWithLLaMA } = require('./videollamaClient'); // <-- add this

const UPLOAD_DIR = path.join(os.homedir(), '.climos', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage });

const Recording = require('./schema/recordingSchema');
const User = require('./schema/userSchema');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected')
  })
  .catch((err) => {
    console.log(err)
  });

// Register Route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json({ error: 'Username already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ username, passwordHash });
  await user.save();

  res.status(201).json({ message: 'User registered successfully' });
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// POST Recording
app.post('/recordings', authenticateToken, upload.single('file'), async function (req, res) {
  try {
    const metadata = JSON.parse(req.body.metadata);

    if (!req.file) {
      return res.status(400).json({ error: 'Recording file is required' });
    }

    const recordingData = {
      ...metadata,
      userId: req.user.id,
      recordingPath: req.file.path,
    };

    const recording = new Recording(recordingData);
    await recording.save();

    // ----------- Video-LLaMA Analysis -----------
    let aiAnalysis = null;
    try {
      aiAnalysis = await analyzeVideoWithLLaMA(req.file.path);
      // Optionally parse aiAnalysis, e.g., if it's stringified JSON
      try { aiAnalysis = JSON.parse(aiAnalysis); } catch { /* leave as-is if not JSON */ }
      recording.aiAnalysis = aiAnalysis;
      await recording.save();
    } catch (err) {
      console.error('Video-LLaMA analysis failed:', err);
    }
    // ---------------------------------------------

    res.status(201).json({
      message: 'Recording and file uploaded successfully',
      aiAnalysis: aiAnalysis,
    });
  } catch (error) {
    console.error('Error saving recording:', error);
    res.status(500).json({ error: 'Failed to save recording' });
  }
});

// Resolve
app.patch('/recordings/resolve-last', authenticateToken, async (req, res) => {
  const { resolved } = req.body;
  if (typeof resolved !== 'boolean') {
    return res.status(400).json({ error: '`resolved` must be boolean' });
  }

  try {
    const lastRecording = await Recording.findOne({ userId: req.user.id }).sort({ timestamp: -1 });

    if (!lastRecording) {
      return res.status(404).json({ error: 'No recordings found for user' });
    }

    lastRecording.resolved = resolved;
    await lastRecording.save();

    res.json({
      message: `Last recording marked as ${resolved ? 'resolved' : 'not resolved'}`,
      recording: lastRecording,
    });
  } catch (error) {
    console.error('Error resolving last recording:', error);
    res.status(500).json({ error: 'Failed to update resolved status' });
  }
});

// 
app.get('/bugs', async (req, res) => {
  try {
    const bugs = await Recording.find().sort({ timestamp: -1 });
    res.json(bugs);
  } catch (err) {
    console.error('Error fetching bugs:', err);
    res.status(500).json({ error: 'Failed to fetch bugs' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server Running @ 3000`);
});