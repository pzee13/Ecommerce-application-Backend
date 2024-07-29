const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true }, // Store Supabase token
    loginTime: {
        type: Date,
        default: Date.now,
    },
    logoutTime: Date,
    ipAddress: String,
}, { timestamps: true });

// Optional: Add an index on the token for faster lookups
sessionSchema.index({ token: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;

