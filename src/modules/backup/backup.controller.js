const archiver = require("archiver");
const responseHandler = require("../../helpers/responseHandler");
const Church = require("../../models/churchModel");
const Plan = require("../../models/planModel");
const Subscription = require("../../models/subscriptionModel");
const User = require("../../models/userModel");
const Magazine = require("../../models/magazineModel");
const { clearCacheByPattern } = require("../../helpers/cacheUtils");

exports.createBackup = async (req, res) => {
  try {
    const [users, churches, plans, subscriptions, magazines] =
      await Promise.all([
        User.find(),
        Church.find(),
        Plan.find(),
        Subscription.find(),
        Magazine.find(),
      ]);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="backup.zip"');

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    archive.append(JSON.stringify(users, null, 2), { name: "users.json" });
    archive.append(JSON.stringify(churches, null, 2), {
      name: "churches.json",
    });
    archive.append(JSON.stringify(plans, null, 2), { name: "plans.json" });
    archive.append(JSON.stringify(subscriptions, null, 2), {
      name: "subscriptions.json",
    });
    archive.append(JSON.stringify(magazines, null, 2), {
      name: "magazines.json",
    });

    archive.finalize();
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.createMagazineBackup = async (req, res) => {
  try {
    const { name, pdfUrl } = req.body;
    if (!name || !pdfUrl) {
      return responseHandler(res, 400, "Name and PDF URL are required.");
    }
    const magazine = await Magazine.create({ name, pdfUrl });
    await clearCacheByPattern("/api/v1/magazines*");
    return responseHandler(res, 200, "Success", magazine);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getMagazines = async (req, res) => {
  try {
    const magazines = await Magazine.find();
    const magazinesCount = await Magazine.countDocuments();
    return responseHandler(res, 200, "Success", magazines, magazinesCount);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.deleteMagazine = async (req, res) => {
  try {
    const magazine = await Magazine.findByIdAndDelete(req.params.id);
    await clearCacheByPattern("/api/v1/magazines*");
    return responseHandler(res, 200, "Success", magazine);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
