const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONN_STRING);
    console.log(" MongoDB connected");
  } catch (err) {
    console.error(" MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
