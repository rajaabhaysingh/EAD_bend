const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const fetch = require("isomorphic-fetch");
const env = require("dotenv");
const nodemailer = require("nodemailer");
const moment = require("moment");

env.config();

// signup controller
exports.signup = async (req, res) => {
  await User.findOne({ email: req.body.email }).exec(async (err, user) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (user && (user.emailVerified || user.phoneVerified)) {
      return res.status(400).json({
        error: `User with email ${req.body.email} already exists.`,
      });
    }

    // --- else continue creating User ---
    // destructure the request data first
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      passwordConfirm,
      phone,
      type,
      reCAPTCHA,
    } = req.body;

    if (password !== passwordConfirm) {
      return res.status(400).json({
        error: "Passwords did not match.",
      });
    } else {
      // verify reCaptcha
      const reCaptchVerfUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${reCAPTCHA}`;

      await fetch(reCaptchVerfUrl, {
        method: "post",
      })
        .then((response) => response.json())
        .then(async (reCaptchaVerRes) => {
          if (reCaptchaVerRes.success) {
            await bcrypt.hash(password, 10, async (hashErr, password_hash) => {
              if (hashErr) {
                return res.status(400).json({
                  error: hashErr,
                });
              }

              if (password_hash) {
                // for OTPVerification
                const tempToken = nanoid(6);

                await User.findOneAndUpdate(
                  {
                    email: email,
                  },
                  {
                    $set: {
                      firstName,
                      middleName: middleName ? middleName : "",
                      lastName: lastName ? lastName : "",
                      email,
                      password_hash,
                      username: nanoid(),
                      role: "user",
                      profilePicture: req.file
                        ? "/private/" + req.file.filename
                        : "",
                      phone,
                      type,
                      tempVerifCode: tempToken,
                      codeExpTime: moment(new Date()).add(10, "m").toDate(),
                      active: true,
                      emailVerified: false,
                      phoneVerified: false,
                      skills: [],
                    },
                  },
                  { new: true, upsert: true }
                ).exec(async (err, createdUser) => {
                  if (err) {
                    return res.status(400).json({
                      error: err,
                    });
                  }

                  if (createdUser) {
                    // send OTP for vefification
                    let transporter = nodemailer.createTransport({
                      host: process.env.SMTP_EMAIL_HOST,
                      port: process.env.SMTP_EMAIL_PORT,
                      secure: false,
                      service: "Gmail",

                      auth: {
                        user: process.env.SMTP_EMAIL_ID,
                        pass: process.env.SMTP_EMAIL_PWD,
                      },
                    });

                    var mailOptions = {
                      from: process.env.SMTP_FROM_EMAIL,
                      to: createdUser.email,
                      subject: "OTP for registration, Wilswork",
                      html:
                        `Hello ${createdUser.firstName},<br><br>` +
                        "Your OTP for account verification is: <br>" +
                        "<h1 style='font-weight:bold;'>" +
                        createdUser.tempVerifCode +
                        "</h1><br>" +
                        "It is valid for only 10 minutes.<br><br><br>" +
                        "Team wilswork<br>www.wilswork.ml",
                    };

                    await transporter.sendMail(
                      mailOptions,
                      (emailError, info) => {
                        if (emailError) {
                          console.log("Email error:", emailError);
                          return res.status(400).json({
                            error:
                              "Error sending verification email. Contact site administrators if this persists.",
                          });
                        }

                        if (info) {
                          // console.log("Message sent: %s", info.messageId);
                          // console.log(
                          //   "Preview URL: %s",
                          //   nodemailer.getTestMessageUrl(info)
                          // );

                          return res.status(201).json({
                            data: {
                              email: createdUser.email,
                              message: "Registration successful.",
                            },
                          });
                        } else {
                          return res.status(400).json({
                            error: "Some unexpected error occured.",
                          });
                        }
                      }
                    );
                  } else {
                    return res.status(400).json({
                      error:
                        "Couldn't register new user. If problem persistes, please contact developer.",
                    });
                  }
                });
              } else {
                return res.status(400).json({
                  error:
                    "Some error occured while creating your account. [code: password-hash]",
                });
              }
            });
          } else {
            return res.status(400).json({
              error: "reCAPTCHA verification failed.",
            });
          }
        })
        .catch((error) => res.status(400).json({ error }));
    }
  });
};

// verifyEmailOtp
exports.verifyEmailOtp = async (req, res) => {
  const { otp, email } = req.body;

  await User.findOne({
    email: email,
  }).exec(async (err, userFound) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (userFound) {
      // check for expiration
      let expired = false;

      if (userFound.codeExpTime) {
        expired =
          moment(userFound.codeExpTime).diff(moment(new Date())) > 0
            ? false
            : true;
      }

      if (expired) {
        return res.status(400).json({
          error:
            "OTP has expired. Please generate new OTP and re-verify your account.",
        });
      } else {
        if (userFound.tempVerifCode === otp) {
          await User.findOneAndUpdate(
            {
              email: userFound.email,
            },
            {
              $set: {
                tempVerifCode: nanoid(6),
                emailVerified: true,
              },
            },
            { new: true }
          ).exec(async (error, updatedUser) => {
            if (error) {
              return res.status(400).json({
                error,
              });
            }

            if (updatedUser) {
              return res.status(200).json({
                data: "Email verification successful.",
              });
            } else {
              return res.status(404).json({
                error: "Something went wrong while vefifying OTP.",
              });
            }
          });
        } else {
          return res.status(404).json({
            error: "Incorrect OTP.",
          });
        }
      }
    } else {
      return res.status(404).json({
        error: "User not found.",
      });
    }
  });
};

// regenerateEmailOTP
exports.regenerateEmailOTP = async (req, res) => {
  const { email } = req.body;

  await User.findOneAndUpdate(
    {
      email: email,
    },
    {
      $set: {
        tempVerifCode: nanoid(6),
        codeExpTime: moment(new Date()).add(10, "m").toDate(),
      },
    },
    {
      new: true,
    }
  ).exec(async (err, updatedUser) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (updatedUser) {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service: "Gmail",

        auth: {
          user: process.env.SMTP_EMAIL_ID,
          pass: process.env.SMTP_EMAIL_PWD,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: updatedUser.email,
        subject: "OTP for account verification, Wilswork",
        html:
          `Hello ${updatedUser.firstName},<br><br>` +
          "Your OTP for account verification is: <br>" +
          "<h1 style='font-weight:bold;'>" +
          updatedUser.tempVerifCode +
          "</h1><br>" +
          "It is valid for only 10 minutes.<br><br><br>" +
          "Team wilswork<br>www.wilswork.ml",
      };

      await transporter.sendMail(mailOptions, (emailError, info) => {
        if (emailError) {
          return res.status(400).json({
            error: emailError,
          });
        }

        if (info) {
          // console.log("Message sent: %s", info.messageId);
          // console.log(
          //   "Preview URL: %s",
          //   nodemailer.getTestMessageUrl(info)
          // );

          return res.status(200).json({
            data: {
              email: updatedUser.email,
              message: "OTP sent successfully.",
            },
          });
        } else {
          return res.status(400).json({
            error:
              "Some unexpected error occured while sending OTP. Please try again or contact us if issue persists.",
          });
        }
      });
    } else {
      return res.status(400).json({
        error:
          "Some unexpected error occured while generating OTP. Make sure you have signed up first.",
      });
    }
  });
};

// login controller
exports.login = async (req, res) => {
  await User.findOne({ email: req.body.email }).exec(async (err, user) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    // --- else continue logging in ---
    if (user) {
      if (user.emailVerified || user.phoneVerified) {
        await bcrypt.compare(
          req.body.password,
          user.password_hash,
          async (pwdErr, compareSuccess) => {
            if (pwdErr) {
              return res.status(400).json({
                error: pwdErr,
              });
            }

            if (compareSuccess) {
              if (user.role === "user") {
                const token = jwt.sign(
                  {
                    _id: user._id,
                    role: user.role,
                    emailVerified: user.emailVerified,
                    phoneVerified: user.phoneVerified,
                  },
                  process.env.JWT_SECRET,
                  { expiresIn: "15d" }
                );

                // destructure the user fields first
                const {
                  _id,
                  firstName,
                  middleName,
                  lastName,
                  role,
                  email,
                  profilePicture,
                  ratings,
                  skills,
                  username,
                } = user;

                res.cookie("token", token, { expiresIn: "15d" });

                return res.status(200).json({
                  token,
                  data: {
                    _id,
                    firstName,
                    middleName,
                    lastName,
                    role,
                    email,
                    profilePicture: profilePicture,
                    ratings,
                    skills,
                    username,
                  },
                });
              } else {
                return res.status(403).json({
                  error: "Access denied.",
                });
              }
            } else {
              if (user.role !== "user") {
                return res.status(403).json({
                  error:
                    "Oops! you are not registered as a 'user'. code[unauthorized]",
                });
              } else {
                // password didn't match
                return res.status(400).json({
                  error: "Wrong email or password provided.",
                });
              }
            }
          }
        );
      } else {
        return res.status(400).json({
          error: "Please verify your account first.",
        });
      }
    } else {
      return res.status(404).json({
        error: `You are not registered. Try creating an account first.`,
      });
    }
  });
};

// sendResetPasswordLink
exports.sendResetPasswordLink = async (req, res) => {
  const { email } = req.body;

  await User.findOne({
    email: email,
  }).exec(async (err, userFound) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (userFound) {
      // using previous password hash with createdAt as secret
      const secret = userFound.password_hash + "-" + userFound.createdAt;
      const resetToken = jwt.sign({ userId: userFound._id }, secret, {
        expiresIn: 600, // 10 minutes
      });

      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service: "Gmail",

        auth: {
          user: process.env.SMTP_EMAIL_ID,
          pass: process.env.SMTP_EMAIL_PWD,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: userFound.email,
        subject: "Password reset link, Wilswork",
        html:
          `Hello ${userFound.firstName},<br><br>` +
          "Your password reset link is: <br><br>" +
          `${process.env.CLIENT_BASE_URL}/reset-password/${userFound._id}?token=${resetToken}` +
          "<br><br>It is valid for only 10 minutes. Please contact us if you have not requested this.<br><br><br>" +
          "Team wilswork<br>www.wilswork.ml",
      };

      await transporter.sendMail(mailOptions, (emailError, info) => {
        if (emailError) {
          return res.status(400).json({
            error: emailError,
          });
        }

        if (info) {
          // console.log("Message sent: %s", info.messageId);
          // console.log(
          //   "Preview URL: %s",
          //   nodemailer.getTestMessageUrl(info)
          // );

          return res.status(200).json({
            data: "Password reset link sent successfully.",
          });
        } else {
          return res.status(400).json({
            error:
              "Some unexpected error occured while sending password reset link. Please try again or contact us if issue persists.",
          });
        }
      });
    } else {
      return res.status(404).json({
        error: "User not found.",
      });
    }
  });
};

// verifyResetPassword
exports.verifyResetPassword = async (req, res) => {
  const { userId, resetToken, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return res.status(400).json({
      error: "Password did not match.",
    });
  } else {
    await User.findOne({ _id: userId }).exec(async (err, userFound) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (userFound) {
        const secret = userFound.password_hash + "-" + userFound.createdAt;
        await jwt.verify(resetToken, secret, async (jwtError, payload) => {
          if (jwtError) {
            if (jwtError.name === "TokenExpiredError") {
              return res.status(400).json({
                error:
                  "Error: Your password reset token has expired. Request password reset link again to change password.",
              });
            } else {
              return res.status(400).json({
                error: jwtError,
              });
            }
          }

          if (payload) {
            if (payload.userId == userFound._id) {
              await bcrypt.hash(password, 10, async (hashErr, pwd_hash) => {
                if (hashErr) {
                  return res.status(400).json({
                    error: hashErr,
                  });
                }

                if (pwd_hash) {
                  await User.findOneAndUpdate(
                    { _id: userFound._id },
                    {
                      $set: {
                        password_hash: pwd_hash,
                      },
                    },
                    { new: false }
                  ).exec((error, updatedUser) => {
                    if (err) {
                      return res.status(400).json({
                        error,
                      });
                    }

                    if (updatedUser) {
                      return res.status(200).json({
                        data: "Password changed successfully.",
                      });
                    } else {
                      return res.status(400).json({
                        error: "Some error occured while updating password.",
                      });
                    }
                  });
                } else {
                  return res.status(400).json({
                    error: "Some error occured while setting new password.",
                  });
                }
              });
            } else {
              return res.status(400).json({
                error:
                  "Password reset token is invalid. Make sure you are not altering the token.",
              });
            }
          } else {
            return res.status(400).json({
              error: "Some error occured while verifying password reset token.",
            });
          }
        });
      } else {
        return res.status(404).json({
          error: "User not found. Make sure you have created an account first.",
        });
      }
    });
  }
};

// -- following method is temporary for now --
// logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({
    data: "Logged out successfully.",
  });
};
