const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const env = require("dotenv");

env.config();

// signup controller
exports.signup = async (req, res) => {
  await Admin.findOne({ email: req.body.email }).exec(async (err, admin) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (admin) {
      return res.status(400).json({
        error: `${req.body.email} is already registered.`,
      });
    }

    // --- else continue creating Admin ---
    // destructure the request data first
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      secret,
    } = req.body;

    if (secret === process.env.ADMIN_SIGNUP_SECRET) {
      const password_hash = await bcrypt.hash(password, 10);

      const ADMIN = new Admin({
        firstName,
        middleName,
        lastName,
        email,
        password_hash,
        username: nanoid(),
        role: "admin",
        profilePicture: req.file ? "/private/" + req.file.filename : "",
      });

      ADMIN.save((err, data) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        if (data) {
          return res.status(201).json({
            data: "Admin created successfully.",
          });
        } else {
          return res.status(400).json({
            error:
              "Couldn't register new user. If problem persistes, please contact developer.",
          });
        }
      });
    } else {
      return res.status(400).json({
        error: `Invalid secret token provided.`,
      });
    }
  });
};

// login controller
exports.login = async (req, res) => {
  await Admin.findOne({ email: req.body.email }).exec(async (err, admin) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    // --- else continue logging in ---
    if (admin) {
      if (
        (await admin.authenticate(req.body.password)) &&
        admin.role === "admin"
      ) {
        // check verified
        if (admin.isVerified) {
          const token = jwt.sign(
            {
              _id: admin._id,
              role: admin.role,
              isVerified: admin.isVerified,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );

          // destructure the admin fields first
          const {
            _id,
            firstName,
            middleName,
            lastName,
            role,
            email,
            fullname,
            profilePicture,
          } = admin;

          res.cookie("token", token, { expiresIn: "1d" });

          res.status(200).json({
            token,
            data: {
              _id,
              firstName,
              middleName,
              lastName,
              role,
              email,
              fullname,
              profilePicture,
            },
          });
        } else {
          return res.status(403).json({
            error: "Verify your account first.",
          });
        }
      } else {
        if (admin.role !== "admin") {
          return res.status(403).json({
            error: "Access denied, user is not an admin.",
          });
        } else {
          // password didn't match
          return res.status(400).json({
            error: "Error: Invalid email/password.",
          });
        }
      }
    } else {
      return res.status(404).json({
        error: `Error: Account not found. Try creating an account first.`,
      });
    }
  });
};

// logout
exports.logout = (req, res, next) => {
  res.clearCookie("token");
  return res.status(200).json({
    data: "Logged out successfully.",
  });
};
