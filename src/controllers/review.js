const Review = require("../models/review");
const Job = require("../models/job");

// addReview
exports.addReview = async (req, res) => {
  const { jobId, review, star } = req.body;

  const _review = {
    user: req.user._id,
    job: jobId,
    review,
    star,
  };

  await Review.findOneAndUpdate(
    {
      job: jobId,
      user: req.user._id,
    },
    _review,
    {
      new: true,
      upsert: true,
    }
  ).exec(async (err, savedReview) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (savedReview) {
      // check increment condition
      let updtCond = {};

      let parsedStar = star;

      try {
        parsedStar = parseInt(parsedStar);
      } catch (error) {
        return res.status(400).json({
          error: "Invalid STAR value provided.",
        });
      }

      switch (parsedStar) {
        case 1:
          updtCond = {
            $push: {
              reviews: savedReview._id,
            },
            $inc: {
              "ratings.oneStar": 1,
            },
          };
          break;

        case 2:
          updtCond = {
            $push: {
              reviews: savedReview._id,
            },
            $inc: {
              "ratings.twoStar": 1,
            },
          };
          break;

        case 3:
          updtCond = {
            $push: {
              reviews: savedReview._id,
            },
            $inc: {
              "ratings.threeStar": 1,
            },
          };
          break;

        case 4:
          updtCond = {
            $push: {
              reviews: savedReview._id,
            },
            $inc: {
              "ratings.fourStar": 1,
            },
          };
          break;

        case 5:
          updtCond = {
            $push: {
              reviews: savedReview._id,
            },
            $inc: {
              "ratings.fiveStar": 1,
            },
          };
          break;

        default:
          updtCond = {
            $push: {
              reviews: savedReview._id,
            },
            $inc: {
              "ratings.oneStar": 1,
            },
          };
          break;
      }

      await Job.findOneAndUpdate(
        {
          _id: jobId,
        },
        updtCond,
        {
          new: true,
        }
      ).exec(async (error, updatedJob) => {
        if (error) {
          return res.status(400).json({
            error,
          });
        }

        if (updatedJob) {
          await Review.findOne({
            _id: savedReview._id,
          })
            .populate({
              path: "user",
              select: "_id firstName middleName lastName profilePicture",
            })
            .exec((findError, revFound) => {
              if (findError) {
                return res.status(400).json({
                  error: findError,
                });
              }

              if (revFound) {
                return res.status(201).json({
                  data: {
                    review: savedReview,
                    updatedJobRatings: updatedJob.ratings,
                  },
                });
              } else {
                return res.status(404).json({
                  error:
                    "We couldn't locate the review posted by you. Please refresh page and try again.",
                });
              }
            });
        } else {
          return res.status(400).json({
            error: "Could not add review/ratings to the job.",
          });
        }
      });
    } else {
      return res.status(400).json({
        error:
          "Some unexpected error occured. Please contact website admin if it persists.",
      });
    }
  });
};

// getAllReviewByJobId
exports.getAllReviewByJobId = async (req, res) => {
  await Review.find({
    job: req.params.jobId,
  })
    .populate("user", "_id firstName middleName lastName profilePicture")
    .exec((err, allRev) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (allRev) {
        return res.status(200).json({
          data: allRev,
        });
      } else {
        return res.status(400).json({
          error:
            "Some unexpected error occured. Please contact website admin if it persists.",
        });
      }
    });
};
