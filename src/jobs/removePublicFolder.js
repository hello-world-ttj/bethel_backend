const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

const publicFolderPath = path.join(__dirname, "public");

const deleteOldFiles = async () => {
  try {
    const files = await fs.promises.readdir(publicFolderPath);

    const now = moment().tz("Asia/Kolkata");

    for (const file of files) {
      const filePath = path.join(publicFolderPath, file);
      const stats = await fs.promises.stat(filePath);
      console.log("🚀 ~ deleteOldFiles ~ stats:", stats)

      const fileModifiedTime = moment(stats.mtime).tz("Asia/Kolkata");
      const ageInDays = now.diff(fileModifiedTime, "days");

      if (ageInDays > 3) {
        await fs.promises.unlink(filePath);
        console.log(`Deleted old file: ${filePath}`);
      }
    }
  } catch (err) {
    console.error("Error deleting old files:", err);
  }
};

cron.schedule("0 2 * * *", deleteOldFiles);
