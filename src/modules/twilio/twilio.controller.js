const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;
const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const responseHandler = require("../../helpers/responseHandler");

exports.sendSMS = async (req, res) => {
  try {
    const { phone, message } = req.body;

    const result = await client.messages.create({
      body: message,
      messagingServiceSid: TWILIO_SERVICE_SID,
      to: phone,
    });

    if (result) {
      return responseHandler(res, 200, "Success", result);
    }
    return responseHandler(res, 400, "Failure");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.checkBalance = async (req, res) => {
  try {
    const balance = await client.balance.fetch();
    return responseHandler(res, 200, "Success", balance);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
