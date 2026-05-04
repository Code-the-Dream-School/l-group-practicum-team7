require("dotenv").config(); //const authMiddleware = require("./middl
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const rateLimit = require("express-rate-limit");
const connectMongo = require("./config/db.mongo");
const helloRoutes = require("./routes/hello.routes");
const entryRoutes = require("./routes/entry.routes");
const app = express();

// Security & best‑practice middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use("/api/hello", helloRoutes);
app.use("/api/entries", entryRoutes);
// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
// Root route
app.get("/", (req, res) => {
  res.send("Backend API is running");
});
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
