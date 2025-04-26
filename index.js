const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

//
const Recording = require('./schema/recordingSchema');
const User = require('./schema/userSchema');


const authenticateToken = require('./middleware/authenticateToken')

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

// 
app.post('/recordings', authenticateToken, async (req, res) => {
  try {
    const recordingData = req.body;
    recordingData.userId = req.user.id;
    const recording = new Recording(recordingData);
    await recording.save();
    res.status(201).send({ message: 'Recording saved successfully' });
  } catch (error) {
    console.error('Error saving recording:', error);
    res.status(500).send({ error: 'Failed to save recording' });
  }
});


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