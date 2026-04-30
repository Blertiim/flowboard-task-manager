require("dotenv").config();

const app = require("./app");
const { connectDatabase } = require("./config/database");
const { ensureBoardSetup } = require("./utils/boardSetup");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    await ensureBoardSetup();
    app.listen(PORT, () => {
      console.log(`Task Manager API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server.", error);
    process.exit(1);
  }
}

startServer();
