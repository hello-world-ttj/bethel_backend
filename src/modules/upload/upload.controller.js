const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const responseHandler = require("../../helpers/responseHandler");

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
