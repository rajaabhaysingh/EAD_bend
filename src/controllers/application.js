const Application = require("../models/application");
const Job = require("../models/job");
const moment = require("moment");

// createApplication
exports.createApplication = async (req, res) => {
  const {
    jobId,
    availableFrom,
    availableTill,
    permanentlyAvailable,
  } = req.body;

  // searching for that particlular job and making sure that job window is open
  await Job.findOne({ _id: jobId })
    .populate("applications", "_id user")
    .exec(async (err, jobFound) => {
      if (err) return res.status(400).json({ error: err });

      // if job found and isn't paused
      if (jobFound && !jobFound.isPaused) {
        // you cannot apply on job created by you
        if (jobFound.owner == req.user._id) {
          return res
            .status(400)
            .json({ error: "You cannot apply on jobs posted by you." });
        } else {
          // checking deadline expiry
          let expired = false;

          if (jobFound.deadline) {
            expired =
              moment(jobFound.deadline).diff(moment(new Date())) > 0
                ? false
                : true;
          }

          // if not expired
          if (!expired) {
            // check if already applied on given job
            const found = jobFound.applications.find(
              (application) => application.user == req.user._id
            );

            if (found) {
              return res.status(400).json({
                error:
                  "You have already applied on this job. Go to my applications to edit it.",
              });
            } else {
              // proceed for new application
              const newApplication = {
                user: req.user._id,
                job: jobFound._id,
                availableFrom,
                availableTill,
                permanentlyAvailable,
              };

              // for cover letter / any file
              let tempFilesArray = [];

              if (req.files) {
                for (const file of req.files) {
                  tempFilesArray.push({
                    file: "/docs/" + file.filename,
                  });
                }

                newApplication.coverLetter = tempFilesArray;
              }

              const _application = new Application(newApplication);

              _application.save(async (saveError, createdAppl) => {
                if (saveError)
                  return res.status(400).json({ error: saveError });

                if (createdAppl) {
                  // push application to job
                  await Job.findOneAndUpdate(
                    {
                      _id: jobFound._id,
                    },
                    {
                      $push: {
                        applications: createdAppl._id,
                      },
                    },
                    {
                      new: false,
                    }
                  ).exec((pushError, pushSuccess) => {
                    if (pushError) {
                      return res.status(400).json({
                        error: pushError,
                      });
                    }

                    if (pushSuccess) {
                      return res.status(201).json({ data: createdAppl });
                    } else {
                      return res.status(400).json({
                        error:
                          "Application generated, but failed to apply. Please try again.",
                      });
                    }
                  });
                } else {
                  return res.status(400).json({
                    error: "Some error occured while applying for job.",
                  });
                }
              });
            }
          } else {
            return res
              .status(400)
              .json({ error: "The deadline for applying has expired." });
          }
        }
      } else {
        return res.status(404).json({
          error:
            "Provided job does not exist or it is not currently accepting applications temporarily.",
        });
      }
    });
};

// getApplications
exports.getApplications = async (req, res) => {
  await Application.find({ user: req.user._id })
    .populate("job", "_id name jobThumbnail payscale payscaleUnit")
    .populate(
      "payments",
      "_id rzp_payment_id amount currency status rzp_order_id desc method error_desc verified"
    )
    .exec((err, applDetails) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (applDetails) {
        return res.status(200).json({
          data: applDetails,
        });
      } else {
        return res.status(404).json({
          error: "No application records found.",
        });
      }
    });
};

// getApplicationById
exports.getApplicationById = async (req, res) => {
  const { appId } = req.params;

  await Application.findOne({
    user: req.user._id,
    _id: appId,
  })
    .populate({
      path: "job",
      select:
        "_id name owner category location duration durationUnit reqQty reqQtyUnit deadline isPaused jobThumbnail payscale payscaleUnit ratings createdAt",
      populate: [
        {
          path: "user",
          select: "_id firstName middleName lastName profilePicture ratings",
        },
        {
          path: "location",
        },
        {
          path: "category",
        },
      ],
    })
    .populate({
      path: "payments",
      select: "_id amount createdAt currency desc rzp_order_id status verified",
    })
    .exec((err, appFound) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (appFound) {
        return res.status(200).json({
          data: appFound,
        });
      } else {
        return res.status(404).json({
          error: "No application records found.",
        });
      }
    });
};

// updateApplication
exports.updateApplication = async (req, res) => {
  const {
    _id,
    availableFrom,
    availableTill,
    permanentlyAvailable,
    filesIds,
  } = req.body;

  // cannot update application once it's accepted
  await Application.findOne({
    user: req.user._id,
    _id: _id,
  }).exec(async (err, targetApplication) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (targetApplication) {
      if (targetApplication.status === "accepted") {
        return res.status(400).json({
          error: "You cannot update an ACCEPTED application.",
        });
      } else {
        // -- proceed for update --
        // check for updated files ~ returns intersection of array
        let updatedFilesArray = targetApplication.coverLetter.filter((file) =>
          filesIds.includes(file._id)
        );

        if (req.files) {
          for (const file of req.files) {
            updatedFilesArray.push({
              file: "/docs/" + file.filename,
            });
          }
        }

        await Application.findOneAndUpdate(
          {
            user: req.user._id,
            _id: targetApplication._id,
          },
          {
            $set: {
              "$.availableFrom": availableFrom,
              "$.availableTill": availableTill,
              "$.permanentlyAvailable": permanentlyAvailable,
              "$.coverLetter": updatedFilesArray,
            },
          },
          { new: true }
        ).exec((error, updtAppl) => {
          if (error) return res.status(400).json({ error });

          if (updtAppl) {
            res.status(200).json({ data: updtAppl });
          } else {
            return res.status(400).json({
              error: "Some unexpected error occured.",
            });
          }
        });
      }
    } else {
      return res.status(404).json({
        error: "Target application not found.",
      });
    }
  });
};

// changeApplicationStatus
exports.changeApplicationStatus = async (req, res) => {
  const { applicationId, status } = req.body;

  // check whether application has job posted by user
  await Application.findOne({ _id: applicationId })
    .populate({
      path: "job",
      select: "_id owner",
      populate: {
        path: "owner",
        model: "User",
        select: "_id",
      },
    })
    .exec(async (error, foundApp) => {
      if (error) {
        return res.status(400).json({
          error: error,
        });
      }

      if (foundApp) {
        if (foundApp.status === "accepted" && status !== "rejected") {
          return res.status(400).json({
            error: "Accepted application can only be rejected.",
          });
        }

        if (foundApp.job.owner._id == req.user._id) {
          await Application.findOneAndUpdate(
            { _id: applicationId },
            {
              $set: {
                status: status,
              },
            },
            {
              new: true,
            }
          )
            .populate("payments")
            .populate({
              path: "user",
              model: "User",
              select:
                "_id firstName middleName lastName profilePicture ratings",
            })
            .exec(async (err, updatedApp) => {
              if (err) {
                return res.status(400).json({
                  error: err,
                });
              }

              if (updatedApp) {
                return res.status(200).json({
                  data: updatedApp,
                });
              } else {
                return res.status(400).json({
                  error:
                    "Some unexpected error occured while updating application status.",
                });
              }
            });
        } else {
          return res.status(403).json({
            error: "You are not authorized to update status.",
          });
        }
      } else {
        return res.status(404).json({
          error:
            "Application not found. Make sure you are accessing correct application.",
        });
      }
    });
};

// deleteApplication
// NOTE: User can delete application even if it gets "accepted".
exports.deleteApplication = async (req, res) => {
  const { applicationId } = req.body;

  await Application.findOneAndRemove({
    user: req.user._id,
    _id: applicationId,
  })
    .populate("job", "_id")
    .exec(async (err, removeSuccessful) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (removeSuccessful) {
        // pull applicationId from Job too
        await Job.findOneAndUpdate(
          { _id: removeSuccessful.job._id },
          {
            $pull: {
              applications: { _id: applicationId },
            },
          }
        ).exec((error, pullSuccessful) => {
          if (error) return res.status(400).json({ error });

          if (pullSuccessful) {
            res.status(200).json({ data: removeSuccessful });
          } else {
            return res.status(400).json({
              error:
                "Some unexpected error occured while removing application.",
            });
          }
        });
      }
    });
};
