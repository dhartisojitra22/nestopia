// models/AgentModel.js
const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  facebookUsername: {
    type: String,
    required: false,
  },
});

const Agent = mongoose.model('Agent', agentSchema);
module.exports = Agent;
