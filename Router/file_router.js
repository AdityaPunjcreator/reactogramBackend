const express = require("express");
const multer = require("multer"); //importing this middleware to handle the upload and download file functionality
const authController = require("../Controller/auth_controller");
const uploadController = require("../Controller/fileuploadController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Downloads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // passing a unique file name
  },
});

const upload = multer({
  storage: storage,
  // limits: { fileSize: 2 * 1024 * 1024 }, // setting limit of the file size
});

router.post("/upload", upload.single("image"), uploadController.uploadfile);

router.get("/files/:filename", uploadController.downloadfile);

module.exports = router;
