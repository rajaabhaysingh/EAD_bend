const express = require("express");
const multer = require("multer");
const path = require("path");
const slugify = require("slugify");
const { nanoid } = require("nanoid");
const {
  postNewJob,
  updateJob,
  getAllJobs,
  getJobById,
  getMyPostings,
  getJobByFilters,
} = require("../controllers/job");
const {
  validateJobPostRequest,
  isJobPostReqValidated,
} = require("../validators/job");
const { requireSignIn, checkUser } = require("../commonMiddlewares");

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

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload image only. No other file type is accepted.", false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});

// post new job process
router.post(
  "/create",
  requireSignIn,
  upload.single("jobThumbnail"),
  validateJobPostRequest,
  isJobPostReqValidated,
  postNewJob
);

router.put(
  "/update",
  requireSignIn,
  upload.single("jobThumbnail"),
  validateJobPostRequest,
  isJobPostReqValidated,
  updateJob
);

router.get("/get-all-jobs", getAllJobs);
router.get("/get-jobs-by-filter", getJobByFilters);
router.get("/get-job-by-id/:jobId", checkUser, getJobById);
router.get("/get-my-postings", requireSignIn, getMyPostings);

// other routes goes here

module.exports = router;
