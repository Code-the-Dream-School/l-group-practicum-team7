require("dotenv").config();
require("express-async-errors");

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");

const helloRoutes = require('./routes/hello.routes');
const sessionRoutes = require('./routes/sessionRoutes');
const connectMongo = require('./config/db.mongo');
const passport = require('passport');
const passportInit = require('./passport/passportInit');
const attachUserFromJwt = require('./middleware/attachUserFromJwt');

const app = express();

app.use(helmet());
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.options('*', cors({ origin: FRONTEND_ORIGIN, credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());
app.use(morgan('dev'));
app.use(xssClean());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

connectMongo();

passportInit();
app.use(passport.initialize());
app.use(attachUserFromJwt);

app.use('/api/auth', sessionRoutes);
app.use('/api/hello', helloRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

module.exports = app;
