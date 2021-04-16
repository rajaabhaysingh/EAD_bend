const express = require("express");
const { requireSignIn, adminMiddleware } = require("../commonMiddlewares");
const {
  addCategory,
  getCategories,
  updateCategories,
  deleteCategories,
} = require("../controllers/category");
const multer = require("multer");
const { nanoid } = require("nanoid");
const path = require("path");
const slugify = require("slugify");

const router = express.Router();

const {
  validateAddCategory,
  isAddCategoryRequestValidated,
} = require("../validators/category");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + "-" + nanoid() + "-" + slugify(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post(
  "/create",
  requireSignIn,
  adminMiddleware,
  upload.single("categoryImage"),
  validateAddCategory,
  isAddCategoryRequestValidated,
  addCategory
);

router.get("/get", getCategories);

router.put(
  "/update",
  requireSignIn,
  adminMiddleware,
  upload.array("categoryImage"),
  validateAddCategory,
  isAddCategoryRequestValidated,
  updateCategories
);

router.delete("/delete", requireSignIn, adminMiddleware, deleteCategories);

module.exports = router;
