const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadFile, uploadToS3 } = require("./upload.controller");
const authVerify = require("../../middlewares/authVerify");
const uploadDir = "/home/ubuntu/church";
//! Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

//* Set up multer middleware
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

const s3Upload = multer();

router.use(authVerify);
router.post("/", upload.single("file"), uploadFile);
router.post("/s3", s3Upload.single("pdf"), uploadToS3);

module.exports = router;
