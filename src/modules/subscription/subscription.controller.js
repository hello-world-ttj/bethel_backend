const responseHandler = require("../../helpers/responseHandler");
const Plan = require("../../models/planModel");
const Subscription = require("../../models/subscriptionModel");
const validation = require("../../validations");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const User = require("../../models/userModel");

exports.createSub = async (req, res) => {
  try {
    const { error } = validation.createSubscription.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const { user, plan: planId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return responseHandler(res, 404, "Plan not found.");
    }

    let latestSub = await Subscription.findOne({ user }).sort({
      expiryDate: -1,
    });

    let expiryDate;
    if (latestSub && latestSub.status !== "expired") {
      expiryDate = new Date(latestSub.expiryDate);
      latestSub.status = "expired";
      await latestSub.save();
    } else {
      expiryDate = new Date();
    }
    expiryDate.setDate(expiryDate.getDate() + plan.days);

    const newSub = await Subscription.create({
      user,
      plan: planId,
      expiryDate,
    });

    await User.findByIdAndUpdate(user, { status: "active" });

    return responseHandler(res, 201, "Success", newSub);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
exports.getSub = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id)
      .populate("user", "name")
      .populate("plan", "name");
    return responseHandler(res, 200, "Success", sub);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateSub = async (req, res) => {
  try {
    const { error } = validation.updateSubscription.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return responseHandler(res, 200, "Success", sub);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteSub = async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(sub.user, { status: "inactive" });
    return responseHandler(res, 200, "Success", sub);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getSubs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    const skipCount = 10 * (page - 1);

    const filter = {};

    if (search) {
      filter.status = { $regex: search, $options: "i" };
    }

    if (status) {
      filter.status = status;
    }

    const subs = await Subscription.find(filter)
      .populate("user", "name")
      .populate("plan", "name")
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await Subscription.find(filter).countDocuments();

    return responseHandler(res, 200, "Success", subs, totalCount);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getSubsUsers = async (req, res) => {
  try {
    const subs = await Subscription.find({ status: "active" }).populate(
      "user",
      "name address"
    );

    const users = Array(30)
      .fill(subs[0])
      .map((sub, index) => ({
        name: `${sub.user.name} ${index + 1}`,
        address: sub.user.address,
      }));

    const publicDir = path.join(__dirname, "../../../public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    const doc = new PDFDocument({ size: "A4", margin: 20 });
    const filename = `labels-${Date.now()}.pdf`;
    const filePath = path.join(publicDir, filename);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const columns = 3;
    const rows = 8;
    const labelWidth = (doc.page.width - doc.options.margin * 2) / columns;
    const labelHeight = (doc.page.height - doc.options.margin * 2) / rows;
    const padding = 5;

    let userIndex = 0;

    while (userIndex < users.length) {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          if (userIndex >= users.length) break;

          const { name, address } = users[userIndex];

          const nameUppercase = name.toUpperCase();
          const addressUppercase = address.toUpperCase();

          const x = doc.options.margin + col * labelWidth;
          const y = doc.options.margin + row * labelHeight;

          doc.rect(x, y, labelWidth, labelHeight).stroke();
          doc.text(`${nameUppercase}`, x + padding, y + padding, {
            width: labelWidth - padding * 2,
            align: "left",
          });
          doc.text(`${addressUppercase}`, x + padding, y + 20, {
            width: labelWidth - padding * 2,
            align: "left",
          });

          userIndex++;
        }
      }

      if (userIndex < users.length) doc.addPage();
    }

    doc.end();

    stream.on("finish", () => {
      const pdfUrl = `${req.protocol}://${req.get("host")}/public/${filename}`;
      return responseHandler(res, 200, "PDF generated successfully", {
        pdfUrl,
      });
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
