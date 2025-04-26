const responseHandler = require("../../helpers/responseHandler");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return responseHandler(res, 400, "No file uploaded");
    }
    return responseHandler(
      res,
      200,
      "File uploaded successfully",
      req.file.filename
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
