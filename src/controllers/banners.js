const Banner = require("../models/banners");
const moment = require("moment");
const env = require("dotenv");

env.config();

// addBanner
exports.addBanner = async (req, res) => {
  const { visible_at, expiry, priority, type, actionUrl } = req.body;

  if (req.body.actionSecret !== process.env.ADMIN_ACTION_SECRET) {
    return res.status(400).json({
      message: "Access denied. Invalid action secret.",
    });
  } else {
    if (req.file) {
      const _banner = new Banner({
        visible_at,
        expiry,
        priority,
        type,
        actionUrl,
        banner: "/uploads/" + req.file.filename,
      });

      _banner.save((err, savedBanner) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        if (savedBanner) {
          return res.status(201).json({
            data: savedBanner,
          });
        } else {
          return res.status(400).json({
            error: "Some unexpected error occured while saving banner.",
          });
        }
      });
    } else {
      return res.status(400).json({
        error: "Banner file not provided.",
      });
    }
  }
};

// updateBanner
exports.updateBanner = async (req, res) => {
  const { _id, visible_at, expiry, priority, type, actionUrl } = req.body;

  if (req.body.actionSecret !== process.env.ADMIN_ACTION_SECRET) {
    return res.status(400).json({
      message: "Access denied. Invalid action secret.",
    });
  } else {
    if (req.file) {
      const _banner = new Banner({
        visible_at,
        expiry,
        priority,
        type,
        actionUrl,
        banner: "/uploads/" + req.file.filename,
      });

      await Banner.findOneAndUpdate(
        {
          _id: _id,
        },
        _banner,
        {
          new: true,
          upsert: true,
        }
      ).exec((err, updatedBanner) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        if (updatedBanner) {
          return res.status(201).json({
            data: updatedBanner,
          });
        } else {
          return res.status(400).json({
            error: "Some unexpected error occured while updating banner.",
          });
        }
      });
    } else {
      return res.status(400).json({
        error: "Banner file not provided.",
      });
    }
  }
};

// getBannersByType
exports.getBannersByType = async (req, res) => {
  if (req.params.type) {
    await Banner.find({
      type: req.params.type,
    }).exec((err, banners) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (banners) {
        // filter out expired banners
        const tempBanners = [];

        for (const banner of banners) {
          // checking expiry
          const expired =
            moment(banner.expiry).diff(moment(new Date())) > 0 ? false : true;

          if (!expired) {
            tempBanners.push(banner);
          }
        }
        return res.status(200).json({
          data: tempBanners,
        });
      } else {
        return res.status(404).json({
          error: "No banners found for the provided type.",
        });
      }
    });
  } else {
    return res.status(400).json({
      error: "Banner type cannot be empty.",
    });
  }
};

// deleteBanner
exports.deleteBanner = async (req, res) => {
  const { bannerId } = req.body;

  if (req.body.actionSecret !== process.env.ADMIN_ACTION_SECRET) {
    return res.status(400).json({
      message: "Access denied. Invalid action secret.",
    });
  } else {
    await Banner.findOneAndRemove({
      _id: bannerId,
    }).exec((err, removeSuccessful) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (removeSuccessful) {
        return res.status(200).json({
          data: "Success",
        });
      }
    });
  }
};
