const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now },
  replied: { type: Boolean, default: false },
  reply: { type: String, default: "" },
});

module.exports = mongoose.model("Message", messageSchema);
