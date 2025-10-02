const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const responseHandler = require("../../helpers/responseHandler");
const { uploadFileToS3 } = require("../../utils/s3Uploader");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return responseHandler(res, 400, "No file uploaded");
    }

    const inputPath = req.file.path;
    const outputFilename = "compressed-" + req.file.filename;
    const outputPath = path.join(path.dirname(inputPath), outputFilename);

    //* Compress the image
    await sharp(inputPath)
      .resize(800) //* resize to width of 800px (optional, you can remove this if not needed)
      .jpeg({ quality: 70 }) //* compress quality to 70% for JPEG
      .toFile(outputPath);

    //* Remove the original uploaded file
    fs.unlinkSync(inputPath);

    return responseHandler(
      res,
      200,
      "File uploaded and compressed successfully",
      outputFilename
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.uploadToS3 = async (req, res) => {
  try {
    if (!req.file) {
      return responseHandler(res, 400, "Image is required");
    }
    const fileUrl = await uploadFileToS3(req.file);
    return responseHandler(
      res,
      200,
      "File uploaded to S3 successfully",
      fileUrl
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
