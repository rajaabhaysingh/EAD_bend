const jwt = require("jsonwebtoken");
const env = require("dotenv");

env.config();

// validating req with token and verifying user
exports.requireSignIn = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    await jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(400).json({
            error:
              "Your login credentials have expired. Please login again to continue.",
          });
        } else {
          return res.status(400).json({
            error: err,
          });
        }
      }

      if (user) {
        req.user = user;

        // check for account verification for user
        if (
          user.role === "user" &&
          !(user.emailVerified || user.phoneVerified)
        ) {
          return res.status(400).json({
            error:
              "Your account is not verified. Please verify your account to continue.",
          });
        } else if (user.role === "admin" && !user.isVerified) {
          return res.status(400).json({
            error:
              "Your account is not verified. Please verify your account to continue.",
          });
        } else {
          next();
        }
      } else {
        return res.status(400).json({
          error:
            "We could not verify your account. Make sure you have created an account.",
        });
      }
    });
  } else {
    return res.status(400).json({
      error: "Authorization credentials were not provided.",
    });
  }
};

// checks if req has user credentials or not
exports.checkUser = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);

    req.user = user;
  }

  next();
};

// checks if the person logging in is "user" or not
exports.userMiddleware = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(400).json({
      message: "Access denied. Require user priviledges.",
    });
  }

  next();
};

exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(400).json({
      message: "Access denied. Require admin priviledges.",
    });
  }
  next();
};
