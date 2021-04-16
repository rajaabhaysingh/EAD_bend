const Address = require("../models/address");

// update or add new address
exports.addAddress = async (req, res) => {
  const {
    name,
    mobileNumber,
    pinCode,
    locality,
    addressLine,
    cityDistrictTown,
    state,
    country,
    landmark,
    lat,
    long,
    alternatePhone,
  } = req.body;

  const address = new Address({
    user: req.user._id,
    name,
    mobileNumber,
    pinCode,
    locality,
    addressLine,
    cityDistrictTown,
    state,
    country,
    landmark,
    lat,
    long,
    alternatePhone,
  });

  address.save((error, savedAddress) => {
    if (error) return res.status(400).json({ error });

    if (savedAddress) {
      return res.status(201).json({ data: savedAddress });
    } else {
      return res.status(400).json({
        error: "Some unexpected error occured while saving address.",
      });
    }
  });
};

// updateAddress
exports.updateAddress = async (req, res) => {
  const {
    name,
    mobileNumber,
    pinCode,
    locality,
    addressLine,
    cityDistrictTown,
    state,
    country,
    landmark,
    lat,
    long,
    alternatePhone,
  } = req.body;

  const address = {
    name,
    mobileNumber,
    pinCode,
    locality,
    addressLine,
    cityDistrictTown,
    state,
    country,
    landmark,
    lat,
    long,
    alternatePhone,
  };

  if (req.body._id) {
    // check if user has right to change address
    await Address.findOne({ _id: req.body._id }).exec(
      async (err, addressFound) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        if (addressFound) {
          if (addressFound.user == req.user._id) {
            await Address.findOneAndUpdate({ _id: req.body._id }, address, {
              new: true,
              upsert: true,
            }).exec((error, savedAddress) => {
              if (error) return res.status(400).json({ error });

              if (savedAddress) {
                res.status(201).json({ data: savedAddress });
              } else {
                return res.status(400).json({
                  error: "Some unexpected error occured while saving address.",
                });
              }
            });
          } else {
            return res.status(401).json({
              error:
                "Access denied! You don't have permission to change selected address.",
            });
          }
        }
      }
    );
  } else {
    return res.status(400).json({ error: "Target address cannot be empty." });
  }
};

// getAddress
exports.getAddress = async (req, res) => {
  await Address.find({ user: req.user._id }).exec((error, userAddress) => {
    if (error) return res.status(400).json({ error });

    if (userAddress) {
      res.status(200).json({ data: userAddress });
    } else {
      return res.status(404).json({ error: "No saved address found." });
    }
  });
};
