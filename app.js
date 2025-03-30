require("dotenv").config();
const express = require("express");
const cors = require("cors");
const volleyball = require("volleyball");
const clc = require("cli-color");
const path = require("path");
const responseHandler = require("./src/helpers/responseHandler");
const userRoutes = require("./src/modules/user/user.routes");
const authRoutes = require("./src/modules/auth/auth.routes");
const churchRoutes = require("./src/modules/church/church.routes");
const plansRoutes = require("./src/modules/plan/plan.routes");
const twilioRoutes = require("./src/modules/twilio/twilio.routes");
const subscriptionRoutes = require("./src/modules/subscription/subscription.routes");
const backupRoutes = require("./src/modules/backup/backup.routes");
const dashboardRoutes = require("./src/modules/dashboard/dashboard.routes");
const { connectRedis } = require("./src/config/redisClient");
const cacheMiddleware = require("./src/middlewares/cacheMiddleware");

//! Create an instance of the Express application
const app = express();
//* Define the PORT & API version based on environment variable
const { PORT, API_VERSION, NODE_ENV } = process.env;
//* Use volleyball for request logging
app.use(volleyball);
//* Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());
//* Parse JSON request bodies
app.use(express.json());
//* Set the base path for API routes
const BASE_PATH = `/api/${API_VERSION}`;
//* Import database connection module
require("./src/helpers/connection");
//* Connect to Redis
connectRedis();

//? Define a route for the API root
app.get(BASE_PATH, (req, res) => {
  return responseHandler(
    res,
    200,
    "🛡️ Welcome! All endpoints are fortified. Do you possess the master 🗝️?"
  );
});

//* Configure routes for user API
app.use(
  `${BASE_PATH}/users`,
  (req, res, next) => {
    if (req.method === "GET") {
      cacheMiddleware(req, res, next);
    } else {
      next();
    }
  },
  userRoutes
);
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(
  `${BASE_PATH}/church`,
  (req, res, next) => {
    if (req.method === "GET") {
      cacheMiddleware(req, res, next);
    } else {
      next();
    }
  },
  churchRoutes
);
app.use(
  `${BASE_PATH}/plans`,
  (req, res, next) => {
    if (req.method === "GET") {
      cacheMiddleware(req, res, next);
    } else {
      next();
    }
  },
  plansRoutes
);
app.use(
  `${BASE_PATH}/subscription`,
  (req, res, next) => {
    if (req.method === "GET") {
      cacheMiddleware(req, res, next);
    } else {
      next();
    }
  },
  subscriptionRoutes
);
// app.use(`${BASE_PATH}/twilio`, twilioRoutes);
app.use(`${BASE_PATH}/backup`, backupRoutes);
app.use(
  `${BASE_PATH}/dashboard`,
  (req, res, next) => {
    if (req.method === "GET") {
      cacheMiddleware(req, res, next);
    } else {
      next();
    }
  },
  dashboardRoutes
);

//* Serve static files (e.g., PDFs) from the 'public' folder
app.use("/public", express.static(path.join(__dirname, "public")));

app.all("*", (req, res) => {
  return responseHandler(res, 404, "No API Found..!");
});

app.listen(PORT, () => {
  const portMessage = clc.redBright(`✓ App is running on port: ${PORT}`);
  const envMessage = clc.yellowBright(
    `✓ Environment: ${NODE_ENV || "development"}`
  );
  console.log(`${portMessage}\n${envMessage}`);
});
