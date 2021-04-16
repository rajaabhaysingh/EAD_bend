const express = require("express");
const multer = require("multer");
const path = require("path");
const slugify = require("slugify");
const { nanoid } = require("nanoid");
const {
  addBanner,
  getBannersByType,
  updateBanner,
  deleteBanner,
} = require("../controllers/banners");
const { requireSignIn, adminMiddleware } = require("../commonMiddlewares");

const router = express.Router();

// saving documents files inside "uploads" folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, nanoid() + "-" + slugify(file.originalname));
  },
});

const upload = multer({ storage: storage });

// post new banner
router.post(
  "/add",
  requireSignIn,
  adminMiddleware,
  upload.single("banner"),
  addBanner
);

router.get("/get/:type", getBannersByType);

router.put(
  "/update",
  requireSignIn,
  adminMiddleware,
  upload.single("banner"),
  updateBanner
);

router.delete("/delete", requireSignIn, adminMiddleware, deleteBanner);

module.exports = router;
