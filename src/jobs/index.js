require("dotenv").config();
const cron = require("node-cron");

const updateSubscription = require("./updateSubscription");
const removePublicFolder = require("./removePublicFolder");

// Every 10 minutes
const CRON_TIME_IST = "*/10 * * * *";

cron.schedule(
  CRON_TIME_IST,
  async () => {
    console.log("===== Running removePublicFolder Job =====");
    await removePublicFolder();
    console.log("===== removePublicFolder Job Finished =====");

    console.log("===== Running updateSubscription Job =====");
    await updateSubscription();
    console.log("===== updateSubscription Job Finished =====");
  },
  {
    timezone: "Asia/Kolkata",
  }
);