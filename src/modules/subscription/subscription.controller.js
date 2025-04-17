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

    const { user, plan: planId, receipt } = req.body;

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
      receipt,
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
      .populate("user", "name church")
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
    const skipCount = limit * (page - 1);

    const match = {};

    if (search) {
      match.$or = [
        { "user.name": { $regex: search, $options: "i" } },
        { receipt: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      match.status = status;
    }

    const subs = await Subscription.aggregate([
      { $skip: skipCount },
      { $limit: Number(limit) },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: match },
      {
        $lookup: {
          from: "plans",
          localField: "plan",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: "$plan" },
      {
        $project: {
          "user._id": 1,
          "user.name": 1,
          "user.phone": 1,
          "plan._id": 1,
          "plan.name": 1,
          expiryDate: 1,
          receipt: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    const totalCount = await Subscription.countDocuments(match);

    return responseHandler(res, 200, "Success", subs, totalCount);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getSubsUsers = async (req, res) => {
  try {
    //! for test printing
    // const subs = await User.find({ role: "user" }).select(
    //   "name address pincode phone"
    // );

    const subs = await Subscription.find({ status: "active" }).populate(
      "user",
      "name address pincode phone"
    );

    if (subs.length === 0) {
      return responseHandler(res, 404, "No active subscriptions found.");
    }

    //! for test printing
    // const users = subs.map((sub) => ({
    //   name: sub.name || "",
    //   address: sub.address || "",
    //   pincode: sub.pincode || "",
    //   phone: sub.phone || "",
    // }));

    const users = subs.map((sub) => ({
      name: sub.user.name || "",
      address: sub.user.address || "",
      pincode: sub.user.pincode || "",
      phone: sub.user.phone || "",
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
    const fontSize = 8;
    const lineSpacing = 12;

    let userIndex = 0;

    while (userIndex < users.length) {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          if (userIndex >= users.length) break;

          const { name, address, pincode, phone } = users[userIndex];

          const nameUppercase = name.toUpperCase();
          const addressUppercase = address.toUpperCase();

          const x = doc.options.margin + col * labelWidth;
          const y = doc.options.margin + row * labelHeight;

          doc.rect(x, y, labelWidth, labelHeight).stroke();
          doc.fontSize(fontSize);

          let currentY = y + padding;

          // Name
          doc.text(`${nameUppercase}`, x + padding, currentY, {
            width: labelWidth - padding * 2,
            align: "left",
          });

          // Address
          currentY += lineSpacing;
          doc.text(`${addressUppercase}`, x + padding, currentY, {
            width: labelWidth - padding * 2,
            align: "left",
          });

          // Add space after address
          currentY += lineSpacing * 1.5;

          // Conditionally show PIN
          if (pincode) {
            doc.text(`PIN: ${pincode}`, x + padding, currentY, {
              width: labelWidth - padding * 2,
              align: "left",
            });
            currentY += lineSpacing;
          }

          // Conditionally show Phone
          if (phone) {
            doc.text(`PH: ${phone}`, x + padding, currentY, {
              width: labelWidth - padding * 2,
              align: "left",
            });
          }

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
