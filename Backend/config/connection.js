const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectMongoDB;
