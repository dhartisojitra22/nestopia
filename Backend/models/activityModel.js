// models/activityModel.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    action: { type: String, required: true },
    user: { type: String, required: true },
    type: { type: String, enum: ['success', 'error', 'info'], default: 'info' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Activity", activitySchema);