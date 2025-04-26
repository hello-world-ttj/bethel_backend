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
const subscriptionRoutes = require("./src/modules/subscription/subscription.routes");
const backupRoutes = require("./src/modules/backup/backup.routes");
const dashboardRoutes = require("./src/modules/dashboard/dashboard.routes");
const uploadRoutes = require("./src/modules/upload/upload.routes");
const {
  connectRedis,
  getRedisConnectionStatus,
} = require("./src/config/redisClient");
const cacheMiddleware = require("./src/middlewares/cacheMiddleware");
const fs = require("fs");

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

//* Health Check Route
app.get("/health", (req, res) => {
  return responseHandler(res, 200, "✅ Server is healthy", {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    redisConnected: getRedisConnectionStatus(),
  });
});

//* Routes with optional caching for GET
const applyCacheIfGet = (route) => [
  (req, res, next) => {
    if (req.method === "GET") {
      if (getRedisConnectionStatus()) {
        return cacheMiddleware(req, res, next);
      } else {
        console.log("⚠️ Redis not connected — skipping cache.");
      }
    }
    next();
  },
  route,
];

//* Configure routes for user API
app.use(`${BASE_PATH}/users`, ...applyCacheIfGet(userRoutes));
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/church`, ...applyCacheIfGet(churchRoutes));
app.use(`${BASE_PATH}/plans`, ...applyCacheIfGet(plansRoutes));
app.use(`${BASE_PATH}/subscription`, ...applyCacheIfGet(subscriptionRoutes));
app.use(`${BASE_PATH}/backup`, backupRoutes);
app.use(`${BASE_PATH}/dashboard`, ...applyCacheIfGet(dashboardRoutes));
app.use(`${BASE_PATH}/upload`, uploadRoutes);

//* Serve static files (e.g., PDFs) from the 'public' folder
app.use("/public", express.static(path.join(__dirname, "public")));

//* Define the directory where the files will be uploaded
const uploadDir = "/home/ubuntu/church";
//* Serve static files from the /home/church folder
app.use("/images", express.static(uploadDir));

//* Ensure the directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
