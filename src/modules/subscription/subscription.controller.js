const responseHandler = require("../../helpers/responseHandler");
const Plan = require("../../models/planModel");
const Subscription = require("../../models/subscriptionModel");
const validation = require("../../validations");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const User = require("../../models/userModel");
const { clearCacheByPattern } = require("../../helpers/cacheUtils");

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
    await clearCacheByPattern("/api/v1/*");
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
    await clearCacheByPattern("/api/v1/*");
    return responseHandler(res, 200, "Success", sub);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteSub = async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(sub.user, { status: "inactive" });
    await clearCacheByPattern("/api/v1/*");
    return responseHandler(res, 200, "Success", sub);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getSubs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skipCount = limit * (page - 1);

    const topMatch = {};
    if (status) {
      topMatch.status = status;
    }

    const searchMatch = {};
    if (search) {
      searchMatch.$or = [
        { "user.name": { $regex: search, $options: "i" } },
        { receipt: { $regex: search, $options: "i" } },
      ];
    }

    const subs = await Subscription.aggregate([
      { $match: topMatch },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      ...(search ? [{ $match: searchMatch }] : []),
      {
        $lookup: {
          from: "plans",
          localField: "plan",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: "$plan" },
      { $sort: { createdAt: -1 } },
      { $skip: skipCount },
      { $limit: Number(limit) },
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

    const countAgg = await Subscription.aggregate([
      { $match: topMatch },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      ...(search ? [{ $match: searchMatch }] : []),
      { $count: "total" },
    ]);

    const totalCount = countAgg[0]?.total || 0;

    return responseHandler(res, 200, "Success", subs, totalCount);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

//? Helper: Wrap long text into multiple lines
function wrapText(text, maxLength = 35) {
  if (!text) return [];
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + " " + word).trim().length <= maxLength) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine.trim());
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine.trim());
  return lines;
}

exports.getSubsUsers = async (req, res) => {
  try {
    //! for test printing
    // const subs = await User.find({ role: "user" }).select(
    //   "salutation name address pincode phone nativePlace"
    // );

    const subs = await Subscription.find({ status: "active" }).populate(
      "user",
      "salutation name address pincode nativePlace street postOffCode"
    );

    if (subs.length === 0) {
      return responseHandler(res, 404, "No active subscriptions found.");
    }

    //! for test printing
    // const users = subs.map((sub) => ({
    //   salutation: sub.salutation || "",
    //   name: sub.name || "",
    //   address: sub.address || "",
    //   pincode: sub.pincode || "",
    //   phone: sub.phone || "",
    //   nativePlace: sub.nativePlace || "",
    // }));

    const users = subs.map((sub) => ({
      salutation: sub.user?.salutation || "",
      name: sub.user?.name || "",
      address: sub.user?.address || "",
      pincode: sub.user?.pincode || "",
      nativePlace: sub.nativePlace || "",
      phone: sub.user?.phone || "",
      street: sub.user?.street || "",
      postOffCode: sub.user?.postOffCode || "",
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
    const lineSpacing = 11;

    doc.font("Helvetica").fontSize(fontSize);

    let userIndex = 0;

    while (userIndex < users.length) {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          if (userIndex >= users.length) break;

          const {
            salutation,
            name,
            address,
            pincode,
            nativePlace,
            street,
            postOffCode,
          } = users[userIndex];
          let lines = [];

          //* Wrapped lines
          lines = [
            ...wrapText(`${salutation.toUpperCase()}. ${name.toUpperCase()}`),
            ...wrapText(address.toUpperCase()),
          ];
          if (street) lines.push(street.toUpperCase());
          if (postOffCode) lines.push(`${postOffCode.toUpperCase()} P.O.`);
          if (nativePlace) lines.push(nativePlace.toUpperCase());
          if (pincode) lines.push(`PIN: ${pincode}`);

          const x = doc.options.margin + col * labelWidth;
          const y = doc.options.margin + row * labelHeight;

          //* Vertical centering
          const totalTextHeight = lines.length * lineSpacing;
          let currentY = y + (labelHeight - totalTextHeight) / 2;

          lines.forEach((line) => {
            doc.text(line, x + padding, currentY, {
              width: labelWidth - 2 * padding,
              align: "center",
            });
            currentY += lineSpacing;
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

exports.getSubByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return responseHandler(res, 400, "User id is required");
    const sub = await Subscription.findOne({ user: id }).populate("plan");
    return responseHandler(res, 200, "Success", sub);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
