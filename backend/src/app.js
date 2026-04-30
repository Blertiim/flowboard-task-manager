const cors = require("cors");
const boardRoutes = require("./routes/boardRoutes");
const express = require("express");
const morgan = require("morgan");
const columnRoutes = require("./routes/columnRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    }
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use("/api/board", boardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);

app.use((error, _request, response, _next) => {
  if (error.name === "ValidationError") {
    return response.status(400).json({ message: error.message });
  }

  if (error.name === "CastError") {
    return response.status(400).json({ message: "Invalid task identifier." });
  }

  console.error(error);
  return response.status(500).json({ message: "Something went wrong on the server." });
});

module.exports = app;
