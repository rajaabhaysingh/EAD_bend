const express = require("express");
const { addReview, getAllReviewByJobId } = require("../controllers/review");
const { requireSignIn } = require("../commonMiddlewares");
const {
  validateAddReview,
  isAddReviewRequestValidated,
} = require("../validators/review");

const router = express.Router();

router.post(
  "/add-review",
  requireSignIn,
  validateAddReview,
  isAddReviewRequestValidated,
  addReview
);

router.get("/get-all-rev-by-id/:jobId", getAllReviewByJobId);

// other routes goes here

module.exports = router;
