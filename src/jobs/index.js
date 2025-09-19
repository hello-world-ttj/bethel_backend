require("dotenv").config();
const cron = require("node-cron");


// Import job functions
const updateSubscription = require("./updateSubscription");
const removePublicFolder = require("./removePublicFolder");

// Run both jobs daily at 10:35 PM IST
const CRON_TIME_IST = "45 22 * * *"; // 10:35 PM IST

// Schedule delete old files job
cron.schedule(CRON_TIME_IST, async () => {
  console.log("===== Running removePublicFolder Job =====");
  await removePublicFolder();
  console.log("===== removePublicFolder Job Finished =====");
});

// Schedule subscription update job
cron.schedule(CRON_TIME_IST, async () => {
  console.log("===== Running updateSubscription Job =====");
  await updateSubscription();
  console.log("===== updateSubscription Job Finished =====");
});

// Optional: immediately run both jobs when starting the script (for testing)
(async () => {
  console.log("===== Initial Run Started =====");
  await removePublicFolder();
  await updateSubscription();
  console.log("===== Initial Run Finished =====");
})();
