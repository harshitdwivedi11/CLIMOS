const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const ModelClient = require('@azure-rest/ai-inference').default;
const isUnexpected = require('@azure-rest/ai-inference').isUnexpected;
const { AzureKeyCredential } = require('@azure/core-auth');


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


// Azure AI Client Setup
const token = process.env.GITHUB_TOKEN;
const endpoint = process.env.AZURE_ENDPOINT;
const model = 'openai/gpt-4.1';
const client = ModelClient(endpoint, new AzureKeyCredential(token));

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
// app.post('/recordings', authenticateToken, async (req, res) => {
//   try {
//     const recordingData = req.body;
//     recordingData.userId = req.user.id;
//     const recording = new Recording(recordingData);
//     await recording.save();
//     res.status(201).send({ message: 'Recording saved successfully' });
//   } catch (error) {
//     console.error('Error saving recording:', error);
//     res.status(500).send({ error: 'Failed to save recording' });
//   }
// });


app.post('/recordings', authenticateToken, async function(req, res) {
  try {
    const recordingData = req.body;
    recordingData.userId = req.user.id;

    const recording = new Recording(recordingData);
    await recording.save();

    const prompt = `
You are an expert debugger.
Session URL: ${recording.recordingPath}
Metadata: ${JSON.stringify(recordingData, null, 2)}

Reply ONLY with valid JSON:
{
  "summary": "...",
  "rootCause": "...",
  "fixSuggestion": "..."
}
    `.trim();

    let aiAnalysis = null;
    try {
      const llmResponse = await client
        .path('/chat/completions')
        .post({
          body: {
            model: model,
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            top_p: 1.0,
          }
        });

      if (isUnexpected(llmResponse)) {
        throw llmResponse.body.error;
      }

      const text = llmResponse.body.choices[0].message.content;
      try {
        aiAnalysis = JSON.parse(text);
      } catch (e) {
        aiAnalysis = { raw: text };
      }

      recording.aiAnalysis = aiAnalysis;
      await recording.save();
    } catch (llmErr) {
      console.error('LLM analysis error:', llmErr);
    }

    res.status(201).json({
      message: 'Recording saved successfully',
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