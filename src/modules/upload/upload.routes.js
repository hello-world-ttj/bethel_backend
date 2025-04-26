const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadFile } = require("./upload.controller");
const authVerify = require("../../middlewares/authVerify");
const uploadDir = "/home/church";
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

router.use(authVerify);
router.post("/file", upload.single("file"), uploadFile);

module.exports = router;
