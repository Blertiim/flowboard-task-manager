const mongoose = require("mongoose");

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured. Copy backend/.env.example to backend/.env and set your database connection string.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
}

module.exports = { connectDatabase };
