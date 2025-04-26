const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected')
    })
    .catch((err) => {
        console.log(err)
    });

const recordingSchema = new mongoose.Schema({
  problemId: String,
  hostname: String,
  platform: String,
  timestamp: Date,
  recordingPath: String,
});

const Recording = mongoose.model('Recording', recordingSchema);
app.use(bodyParser.json());

app.post('/recordings', async (req, res) => {
    try {
      const recording = new Recording(req.body);
      await recording.save();
      res.status(201).send({ message: 'Recording saved successfully' });
    } catch (error) {
      console.error('Error saving recording:', error);
      res.status(500).send({ error: 'Failed to save recording' });
    }
  });


app.listen(process.env.PORT, () => {
    console.log(`Server Running @ 3000`);
});