require("dotenv").config();
const cron = require("node-cron");

// Import job functions
const updateSubscription = require("./updateSubscription");
const removePublicFolder = require("./removePublicFolder");

// Every 10 minutes
const CRON_TIME_IST = "*/10 * * * *";

// Schedule both jobs sequentially with timezone set to Asia/Kolkata
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

// Optional: immediately run both jobs when starting the script (for testing)
(async () => {
  console.log("===== Initial Run Started =====");
  await removePublicFolder();
  await updateSubscription();
  console.log("===== Initial Run Finished =====");
})();
