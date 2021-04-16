const slugify = require("slugify");
const Category = require("../models/category");
const env = require("dotenv");

env.config();

// --- helper function for getCategory ---
// creates recursive category list (nested list)
const createCatList = (categories, parentId = null) => {
  const categoryList = [];
  let tempCatList;

  if (parentId == null) {
    tempCatList = categories.filter(
      (cat) => cat.parentId == "undefined" || !cat.parentId
    );
  } else {
    tempCatList = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of tempCatList) {
    categoryList.push({
      _id: cate._id,
      categoryName: cate.categoryName,
      slug: cate.slug,
      parentId: cate.parentId,
      categoryImage: cate.categoryImage,
      children: createCatList(categories, cate._id),
      updatedAt: cate.updatedAt,
      createdAt: cate.createdAt,
    });
  }

  return categoryList;
};

// add new category
exports.addCategory = async (req, res) => {
  const categoryObj = {
    categoryName: req.body.categoryName,
    slug: `${slugify(req.body.categoryName)}`,
  };

  if (req.body.actionSecret !== process.env.ADMIN_ACTION_SECRET) {
    return res.status(400).json({
      message: "Access denied. Invalid action secret.",
    });
  } else {
    // if category with same name already exists
    await Category.findOne({ slug: categoryObj.slug }).exec((err, category) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (category) {
        return res.status(400).json({
          error: `Category with name ${categoryObj.categoryName} already exists.`,
        });
      } else {
        // proceed creating category

        if (req.file) {
          categoryObj.categoryImage = "/uploads/" + req.file.filename;
        }

        if (req.body.parentId) {
          categoryObj.parentId = req.body.parentId;
        }

        const cat = new Category(categoryObj);
        cat.save((error, category) => {
          if (error) return res.status(400).json({ error: error });

          if (category) {
            return res.status(201).json({ data: category });
          }
        });
      }
    });
  }
};

// get list of all categories
exports.getCategories = (req, res) => {
  Category.find({}).exec((err, categories) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (categories) {
      // recursive function to fetch all categories
      const categoryList = createCatList(categories);

      return res.status(200).json({
        data: categoryList,
      });
    }
  });
};

// update single/multiple categories at once
exports.updateCategories = async (req, res) => {
  const { _id, categoryName, parentId, imgId } = req.body;
  const updatedCategories = [];

  // --- helper function ---
  const getCatImage = (id) => {
    for (let i = 0; i < imgId.length; i++) {
      if (id == imgId[i]) {
        return req.files[i];
      }
    }
    return null;
  };

  if (req.body.actionSecret !== process.env.ADMIN_ACTION_SECRET) {
    return res.status(400).json({
      message: "Access denied. Invalid action secret.",
    });
  } else {
    if (categoryName instanceof Array) {
      for (let i = 0; i < categoryName.length; i++) {
        const category = {
          categoryName: categoryName[i],
          slug: slugify(categoryName[i]),
        };
        if (parentId[i] !== "") {
          category.parentId = parentId[i];
        }

        const updatedCatImg = getCatImage(_id[i]);

        if (updatedCatImg) {
          category.categoryImage = "/uploads/" + updatedCatImg.filename;
        }

        await Category.findOneAndUpdate(
          { _id: _id[i] },
          category,
          { new: true },
          (err, updatedCat) => {
            if (err) {
              return res.status(400).json({
                error: err,
              });
            }

            if (updatedCat) {
              updatedCategories.push(updatedCat);
            } else {
              return res.status(400).json({
                error: "Some error occured while updating categories.",
              });
            }
          }
        );
      }
      return res.status(201).json({ data: updatedCategories });
    } else {
      const category = {
        categoryName,
        slug: slugify(categoryName),
      };
      if (req.files[0]) {
        category.categoryImage = "/uploads/" + req.files[0].filename;
      }
      if (parentId !== "") {
        category.parentId = parentId;
      }
      await Category.findOneAndUpdate(
        { _id },
        category,
        {
          new: true,
        },
        (err, updatedCat) => {
          if (err) {
            console.log(err);
            return res.status(400).json({
              error: err,
            });
          }

          if (updatedCat) {
            return res.status(201).json({ data: updatedCat });
          } else {
            return res.status(400).json({
              error: "Some error occured while updating categories.",
            });
          }
        }
      );
    }
  }
};

// delete single/multiple categories at once
exports.deleteCategories = async (req, res) => {
  const payload = req.body;
  const deletedCategories = [];

  if (req.body.actionSecret !== process.env.ADMIN_ACTION_SECRET) {
    return res.status(400).json({
      message: "Access denied. Invalid action secret.",
    });
  } else {
    for (let i = 0; i < payload.length; i++) {
      const deletedCat = await Category.findByIdAndDelete(payload[i]);
      deletedCategories.push(deletedCat);
    }
    if (deletedCategories.length == payload.length) {
      return res.status(200).json({ data: deletedCategories });
    } else {
      return res.status(400).json({
        error: "Some error occured while deleting categories.",
      });
    }
  }
};
