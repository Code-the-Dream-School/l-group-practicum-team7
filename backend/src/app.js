require("dotenv").config();
require("express-async-errors");

const path = require("path");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

const connectDB = require("./db/connect");

const helloRoutes = require("./routes/helloRoutes.js");
const insightsRoutes = require("./routes/insightsRoutes.js");
const sessionRoutes = require("./routes/sessionRoutes");
const entryRoutes = require("./routes/entryRoutes.js");
const dialogueRoutes = require("./routes/dialogueRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

const passportInit = require("./passport/passportInit");
const attachUserFromJwt = require("./middleware/attachUserFromJwt");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

const allowedOrigins = (
  process.env.CLIENT_ORIGINS ||
  process.env.FRONTEND_ORIGIN ||
  "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

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

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
app.use("/api/hello", helloRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/dialogues", dialogueRoutes);
app.use("/api/subscription", subscriptionRoutes);

if (process.env.NODE_ENV !== "production") {
  app.get("/", (req, res) => {
    res.send("Backend API is running");
  });
}

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../../frontend/dist");

  app.use(express.static(frontendDist));

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = { app, connectDB };