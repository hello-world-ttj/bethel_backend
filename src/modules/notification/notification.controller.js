const validation = require("../../validations");
const responseHandler = require("../../helpers/responseHandler");
const User = require("../../models/userModel");
const NotificationLog = require("../../models/notificationLogModel");

exports.createNotification = async (req, res) => {
  try {
    const { error } = validation.createNotification.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const { users, subject, content, media } = req.body;
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

    const createNotification = await NotificationLog.create(req.body);

    return responseHandler(
      res,
      200,
      `Notification created successfully..!`,
      createNotification
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getNoficationsLogs = async (req, res) => {
  try {
    const notifications = await NotificationLog.find();
    return responseHandler(res, 200, "Success", notifications);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
