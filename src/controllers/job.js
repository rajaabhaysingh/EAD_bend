const Job = require("../models/job");
const mongoose = require("mongoose");
const moment = require("moment");

// create new job
exports.postNewJob = async (req, res) => {
  // destructuring form data first
  const {
    name,
    category,
    location,
    desc,
    duration,
    durationUnit,
    isPermanent,
    reqQty,
    reqQtyUnit,
    deadline,
    isPaused,
    prerequisites,
    facilities,
    faqs,
    payscale,
    payscaleUnit,
  } = req.body;

  // parse faqs
  let faqList = [];

  if (faqs && faqs.length > 0) {
    try {
      faqList = JSON.parse(faqs);
    } catch (error) {
      return res.status(400).json({
        error: "Malformed FAQs submitted.",
      });
    }
  }

  // parse facilities
  let facilityList = [];

  if (facilities && facilities.length > 0) {
    try {
      facilityList = JSON.parse(facilities);
    } catch (error) {
      return res.status(400).json({
        error: "Malformed facilities submitted.",
      });
    }
  }

  const JOB = new Job({
    name: name,
    owner: req.user,
    jobThumbnail: req.file ? "/uploads/" + req.file.filename : "",
    category,
    location,
    desc,
    duration,
    durationUnit,
    isPermanent,
    reqQty,
    reqQtyUnit,
    deadline,
    isPaused,
    prerequisites,
    facilities: facilityList,
    faqs: faqList,
    payscale,
    payscaleUnit,
  });

  JOB.save(async (error, savedJob) => {
    if (error) return res.status(400).json({ error: error });

    if (savedJob) {
      await Job.findOne({ _id: savedJob._id })
        .select(
          "_id name category location jobThumbnail duration durationUnit isPermanent reqQty reqQtyUnit deadline payscale payscaleUnit applications createdAt"
        )
        .populate("location", "_id pinCode cityDistrictTown")
        .populate("category")
        .exec((err, foundJob) => {
          if (err) {
            return res.status(400).json({
              error: err,
            });
          }

          if (foundJob) {
            return res.status(201).json({
              data: foundJob,
            });
          } else {
            return res.status(404).json({
              error:
                "Job posted successfully but couldn't fetach data. Please refresh the page to continue.",
            });
          }
        });
    } else {
      return res.status(400).json({
        error:
          "Some unexpected error occured. Please contact developer if problem persists. [code: 400]",
      });
    }
  });
};

// updateJob
exports.updateJob = async (req, res) => {
  const {
    jobId,
    name,
    category,
    location,
    desc,
    duration,
    durationUnit,
    isPermanent,
    reqQty,
    reqQtyUnit,
    deadline,
    isPaused,
    prerequisites,
    facilities,
    faqs,
    payscale,
    payscaleUnit,
  } = req.body;

  let faqError = false;
  let facilitiesError = false;

  // parse faqs
  let faqList = [];

  if (faqs && faqs.length > 0) {
    try {
      faqList = JSON.parse(faqs);
    } catch (error) {
      faqError = true;
      return res.status(400).json({
        error: "Malformed FAQs submitted.",
      });
    }
  }

  // parse facilities
  let facilityList = [];

  if (facilities && facilities.length > 0) {
    try {
      facilityList = JSON.parse(facilities);
      // again proceed
    } catch (error) {
      facilitiesError = true;
      return res.status(400).json({
        error: "Malformed facilities submitted.",
      });
    }
  }

  if (!facilitiesError && !faqError) {
    await Job.findOne({
      _id: jobId,
    }).exec(async (err, jobFound) => {
      if (err) return res.status(400).json({ error: err });

      if (jobFound) {
        // checking job owner
        if (jobFound.owner == req.user._id) {
          // checking deadline expiry
          let expired = false;

          if (jobFound.deadline) {
            expired =
              moment(jobFound.deadline).diff(moment(new Date())) > 0
                ? false
                : true;
          }

          if (expired) {
            return res.status(400).json({
              error: "You cannot update expired job postings.",
            });
          } else {
            await Job.findOneAndUpdate(
              {
                _id: jobFound._id,
              },
              {
                $set: {
                  name,
                  category,
                  location,
                  desc,
                  duration,
                  durationUnit,
                  isPermanent,
                  reqQty,
                  reqQtyUnit,
                  deadline,
                  isPaused,
                  prerequisites,
                  facilities: facilityList,
                  faqs: faqList,
                  payscale,
                  payscaleUnit,
                  jobThumbnail: req.file
                    ? "/uploads/" + req.file.filename
                    : jobFound.jobThumbnail,
                },
              },
              {
                new: true,
              }
            )
              .populate("location")
              .populate("category")
              .populate({
                path: "reviews",
                count: 5,
                populate: {
                  path: "user",
                  select: "_id firstName middleName lastName",
                },
              })
              .exec((error, updatedJob) => {
                if (error) {
                  return res.status(400).json({
                    error,
                  });
                }

                if (updatedJob) {
                  return res.status(200).json({
                    data: updatedJob,
                  });
                } else {
                  return res.status(400).json({
                    error:
                      "Some unknown error occured. Contact admin if it persists.",
                  });
                }
              });
          }
        } else {
          return res.status(400).json({
            error: "Access denied. You cannot update jobs posted by others.",
          });
        }
      } else {
        return res.status(404).json({
          error: "The job you are trying to update does not exist. [code: 404]",
        });
      }
    });
  }
};

// getAllJobs
exports.getAllJobs = async (req, res) => {
  await Job.find({})
    .select(
      "_id name owner category location payscale payscaleUnit jobThumbnail duration durationUnit isPermanent reqQty reqQtyUnit deadline payscale payscaleUnit ratings createdAt"
    )
    .populate("location", "_id pinCode cityDistrictTown")
    .populate("owner", "_id firstName middleName lastName")
    .populate("category")
    .exec((err, course) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (course) {
        return res.status(200).json({
          data: course,
        });
      } else {
        return res.status(404).json({
          error:
            "Requested content could not be found on our server. [code: 404]",
        });
      }
    });
};

// getJobById
exports.getJobById = async (req, res) => {
  await Job.findOne({ _id: req.params.jobId })
    .populate("location")
    .populate({
      path: "owner",
      select: "_id firstName middleName lastName profilePicture",
    })
    .populate("category")
    .populate({
      path: "reviews",
      options: {
        limit: 3,
        sort: { helpfulCount: -1 },
      },
      populate: {
        path: "user",
        model: "User",
        select: "_id firstName middleName lastName profilePicture",
      },
    })
    // .populate("reviews.user")
    .populate({
      path: "applications",
      options: {
        limit: 10,
      },
      populate: [
        {
          path: "payments",
          model: "Payment",
          select:
            "_id amount createdAt currency desc rzp_order_id status verified",
        },
        {
          path: "user",
          model: "User",
          select: "_id firstName middleName lastName profilePicture ratings",
        },
      ],
    })
    .exec((err, jobFound) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (jobFound) {
        // if searched job's owner and req.user are same
        // return full information
        if (req.user && jobFound.owner._id == req.user._id) {
          return res.status(200).json({
            data: jobFound,
          });
        } else {
          return res.status(200).json({
            data: {
              _id: jobFound._id,
              name: jobFound.name,
              owner: jobFound.owner,
              category: jobFound.category,
              location: jobFound.location,
              desc: jobFound.desc,
              duration: jobFound.duration,
              durationUnit: jobFound.durationUnit,
              isPermanent: jobFound.isPermanent,
              reqQty: jobFound.reqQty,
              reqQtyUnit: jobFound.reqQtyUnit,
              deadline: jobFound.deadline,
              isPaused: jobFound.isPaused,
              prerequisites: jobFound.prerequisites,
              facilities: jobFound.facilities,
              faqs: jobFound.faqs,
              jobThumbnail: jobFound.jobThumbnail,
              payscale: jobFound.payscale,
              payscaleUnit: jobFound.payscaleUnit,
              applicationCount: jobFound.applications.length,
              reviews: jobFound.reviews,
              ratings: jobFound.ratings,
              createdAt: jobFound.createdAt,
            },
          });
        }
      } else {
        return res.status(404).json({
          // --- IMPORTANT ---
          // *** -- do not change following error message -- ***
          // this message is used to redirect to job not found page in frontend
          error: "Job not found. [code: 404]",
        });
      }
    });
};

// getJobsByCategories
// exports.getJobsByCategories = async (req, res) => {};

// getJobByFilters
exports.getJobByFilters = async (req, res) => {
  let aggregate_options = [];
  const limit_range = 24;

  //PAGINATION
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || limit_range;

  //set the options for pagination
  const options = {
    page,
    limit,
    collation: { locale: "en" },
    customLabels: {
      totalDocs: "totalResults",
      docs: "jobs",
    },
  };

  //FILTERING AND PARTIAL TEXT SEARCH -- FIRST STAGE
  // match job parameters
  let match = {
    isPaused: false,
    deadline: { $gte: new Date() },
  };

  //filter by name - use $regex in mongodb - add the 'i' flag if you want the search to be case insensitive.
  if (req.query.q) {
    match.name = { $regex: req.query.q, $options: "i" };
  }

  // match by category
  if (req.query.catId) {
    match.category = mongoose.Types.ObjectId(req.query.catId);
  }

  //filter by date
  // if (req.query.date) {
  //   let d = moment(req.query.date);
  //   let next_day = moment(d).add(1, "days"); // add 1 day

  //   match.start_date = { $gte: new Date(d), $lt: new Date(next_day) };
  // }

  aggregate_options.push({ $match: match });

  // //GROUPING -- SECOND STAGE
  // if (req.query.group !== "false" && parseInt(req.query.group) !== 0) {
  //   let group = {
  //     _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group By Expression
  //     data: { $push: "$$ROOT" },
  //   };

  //   aggregate_options.push({ $group: group });
  // }

  //SORTING -- THIRD STAGE
  let sortOrder =
    req.query.sort_order && req.query.sort_order === "desc" ? -1 : 1;
  aggregate_options.push({ $sort: { "data.createdAt": sortOrder } });

  //LOOKUP/JOIN -- FOURTH STAGE

  // populating user
  aggregate_options.push({
    $lookup: {
      from: "users",
      let: { owner_id: "$owner" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$owner_id"] } } },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            middleName: 1,
            _id: 1,
            profilePicture: 1,
          },
        },
      ],
      as: "owner_details",
    },
  });

  // populating addresses
  aggregate_options.push({
    $lookup: {
      from: "addresses",
      let: { location_id: "$location" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$location_id"] } } },
        {
          $project: {
            cityDistrictTown: 1,
            pinCode: 1,
            _id: 1,
          },
        },
      ],
      as: "location_details",
    },
  });

  // Set up the aggregation
  const myAggregate = Job.aggregate(aggregate_options);

  await Job.aggregatePaginate(myAggregate, options, (err, jobs) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (jobs) {
      return res.status(200).json({
        data: jobs,
      });
    } else {
      return res.status(404).json({
        error:
          "Requested content could not be found on our server. [code: 404]",
      });
    }
  });
};

// getMyPostings
exports.getMyPostings = async (req, res) => {
  await Job.find({ owner: req.user._id })
    .select(
      "_id name category location jobThumbnail duration durationUnit isPermanent reqQty reqQtyUnit deadline payscale payscaleUnit applications createdAt"
    )
    .populate("location", "_id pinCode cityDistrictTown")
    .populate("category")
    .exec((err, jobs) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (jobs) {
        return res.status(200).json({
          data: jobs,
        });
      } else {
        return res.status(400).json({
          error: "You have no active postings.",
        });
      }
    });
};
