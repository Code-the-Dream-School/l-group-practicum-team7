require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

const connectDB = require("./db/connect");

const helloRoutes = require("./routes/hello.routes");
const insightsRoutes = require("./routes/insights.routes");
const sessionRoutes = require("./routes/sessionRoutes");
const entryRoutes = require("./routes/entry.routes.js");
const dialogueRoutes = require("./routes/dialogueRoutes");

const passportInit = require("./passport/passportInit");
const attachUserFromJwt = require("./middleware/attachUserFromJwt");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");


const app = express();

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

app.use(express.json());
app.use(morgan("dev"));
app.use(xssClean());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

passportInit();
app.use(passport.initialize());

app.use(attachUserFromJwt);
app.use("/api/auth", sessionRoutes);

app.get("/", (req, res) => {
  res.send("Backend API is running");
});

app.use("/api/hello", helloRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/dialogues", dialogueRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = { app, connectDB };