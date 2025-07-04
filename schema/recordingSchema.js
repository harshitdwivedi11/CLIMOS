const mongoose = require('mongoose');
const recordingSchema = new mongoose.Schema({
    problemId: String,
    hostname: String,
    platform: String,
    timestamp: Date,
    recordingPath: String,
    resolved: {type: Boolean, default: false},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  });
  
const Recording = mongoose.model('Recording', recordingSchema);

module.exports = Recording;