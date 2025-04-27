const validation = require("../../validations");
const responseHandler = require("../../helpers/responseHandler");
const User = require("../../models/userModel");
const NotificationLog = require("../../models/notificationLogModel");
const sendMail = require("../../utils/sendMail");
const { clearCacheByPattern } = require("../../helpers/cacheUtils");

exports.createNotification = async (req, res) => {
  try {
    const { error } = validation.createNotification.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const { users, subject, content, media, type } = req.body;

    let url;
    if (type === "email") {
      await handleEmail(users, subject, content, media);
    } else if (type === "whatsapp") {
      url = await handleWhatsApp(users, subject, content);
    }

    const createNotification = await NotificationLog.create(req.body);
    await clearCacheByPattern("/api/v1/notification*");
    const returnData = type === "email" ? createNotification : url;

    return responseHandler(
      res,
      200,
      `Notification created successfully..!`,
      returnData
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

async function handleEmail(users, subject, content, media) {
  let userEmails = [];

  if (users.length > 0) {
    for (let i = 0; i < users.length; i++) {
      const id = users[i];
      const foundUser = await User.findById(id).select("email");
      if (foundUser && foundUser.email) {
        userEmails.push(foundUser.email);
      }
    }
  }

  const attachments = media
    ? [
        {
          filename: media.split("/").pop(),
          path: media,
        },
      ]
    : [];

  for (const email of userEmails) {
    const mailData = {
      to: email,
      subject,
      text: content,
      attachments,
    };
    await sendMail(mailData);
  }
}

async function handleWhatsApp(users, subject, content) {
  const baseUrl = "https://api.whatsapp.com/send";
  const message = `*${subject}*\n${content}`;
  const encodedMessage = encodeURIComponent(message);
  const findUser = await User.findById(users[0]).select("phone");
  const phoneNumber = findUser?.phone;

  if (phoneNumber) {
    const url = `${baseUrl}?phone=${phoneNumber}&text=${encodedMessage}&type=custom_url&app_absent=0`;
    return url;
  }
}

exports.getNoficationsLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skipCount = limit * (page - 1);
    const totalCount = await NotificationLog.countDocuments();
    const notifications = await NotificationLog.find()
      .skip(skipCount)
      .limit(limit)
      .populate({
        path: "users",
        select: "name",
      });
    return responseHandler(res, 200, "Success", notifications, totalCount);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
