const express = require("express");
const { requireSignIn, userMiddleware } = require("../commonMiddlewares");
const {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
  changeApplicationStatus,
  getApplicationById,
} = require("../controllers/application");
const path = require("path");
const { nanoid } = require("nanoid");
const slugify = require("slugify");
const multer = require("multer");

const router = express.Router();

// saving documents files inside "uploads" folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "files"));
  },
  filename: function (req, file, cb) {
    cb(null, nanoid() + "___" + slugify(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post(
  "/create",
  requireSignIn,
  userMiddleware,
  upload.array("coverLetter"),
  createApplication
);

router.get("/get", requireSignIn, userMiddleware, getApplications);
router.get(
  "/get-by-id/:appId",
  requireSignIn,
  userMiddleware,
  getApplicationById
);

router.put(
  "/update",
  requireSignIn,
  userMiddleware,
  upload.array("coverLetter"),
  updateApplication
);

router.put(
  "/change-status",
  requireSignIn,
  userMiddleware,
  changeApplicationStatus
);

router.delete("/delete", requireSignIn, userMiddleware, deleteApplication);

module.exports = router;
