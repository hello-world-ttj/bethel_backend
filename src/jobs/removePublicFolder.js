require("dotenv").config();
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

// Resolve from GitHub Actions workspace (repo root)
const publicFolderPath = path.join(
  process.env.GITHUB_WORKSPACE || process.cwd(),
  "../public"
);

const removePublicFolder = async () => {
  try {
    console.log("Resolved public folder path:", publicFolderPath);

    if (!fs.existsSync(publicFolderPath)) {
      console.log(`Folder does not exist: ${publicFolderPath}`);
      return;
    }

    const files = await fs.promises.readdir(publicFolderPath);
    const now = moment().tz("Asia/Kolkata");

    for (const file of files) {
      const filePath = path.join(publicFolderPath, file);
      const stats = await fs.promises.stat(filePath);

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

module.exports = removePublicFolder;
