// models/SessionModel.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
  logoutTime: Date,
  ipAddress: String,
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
