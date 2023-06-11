const Products = require("../models/products.model");
const ImageClass = require("../models/images.model");

const Auth = require("../utils/auth");

//TODO: add auth user
exports.create = (req, res) => {
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    if (!req.body) {
      res.status(400).send({ message: "content can not be empty!" });
    }
    // Validate the input products
    if (!isValidProduct(req, res)) {
      return;
    } // isValidInput end
    const product = new Products({
      category: req.body.category,
      sellerId: req.body.sellerId, //req.body.sellerId,
      productCode: req.body.productCode,
      productName: req.body.productName,
      productDesc: req.body.productDesc,
      price: req.body.price,
      stockNum: req.body.stockNum,
      imageUrl: req.body.imageUrl,
      available: req.body.available,
    });

    Products.create(product, (err, data) => {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          res.status(209).send({
            message:
              err.message || "Duplicate entry for key 'products.PRIMARY'",
          });
        } else {
          res.status(500).send({
            message:
              err.message || "some error occured while creating the product.",
          });
        }
      } else res.send(data);
    });
  }); // Auth.execIfAuthValid end
};

exports.findAll = (req, res) => {
  const category = req.query.category ? req.query.category : null;
  const searchFor = req.query.searchFor ? req.query.searchFor : null;
  const available = req.query.available ? req.query.available : null;
  const sellerId = req.query.sellerId ? req.query.sellerId : null;
  const userName = req.query.userName ? req.query.userName : null;
  //FIXME: validate sellerId
  //console.log(req.query);
  Products.getAll(
    category,
    searchFor,
    available,
    sellerId,
    userName,
    (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Products.",
        });
      else res.status(200).send(data);
    }
  );
};

exports.findOne = (req, res) => {
  // Auth.execIfAuthValid(req, res, null, (req, res, user) => {
  const id = req.params.id;
  // console.log(req.query);
  Products.getById(id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found products with id ${id}.`,
        });
      } else
        res.status(500).send({
          message:
            err.message || "Some error occured while retrieving the product.",
        });
    } else res.status(200).send(data);
  });
  // });
};

exports.update = (req, res) => {
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!",
      });
    }
    console.log(req.body);
    Products.updateById(req.params.id, new Products(req.body), (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Products with id ${req.params.id}.`,
          });
        } else {
          res.status(500).send({
            message: `Error updating Products with id ${req.params.id}`,
          });
        }
      } else res.status(200).send(data);
    });
  });
};

exports.updateStock = (req, res) => {
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!",
      });
    }
    const stockNum = req.body.stockNum;
    const available = req.body.available;

    // Add validation for stockNum to make sure it >0
    if (stockNum <= 0) {
      res.status(400).send({
        message: "Invalid stock number. It must be greater than zero.",
      });
      return;
    }
    console.log(req.body);
    Products.updateStockById(
      req.params.id,
      stockNum,
      available,
      user, // passing the user to updateStockById to check the user role
      (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found Products with id ${req.params.id}.`,
            });
          } else if (err.kind === "invalid_stockNum") {
            res.status(400).send({
              message: `As a buyer, you can't increase the stock number.`,
            });
          } else {
            res.status(500).send({
              message: `Error updating Products with id ${req.params.id}`,
            });
          }
        } else res.status(200).send(data);
      }
    );
  });
};

exports.delete = (req, res) => {
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    ImageClass.removeByProductId(req.params.id, (err, data) => {
      if (err && err.kind !== "not_found") {
        res.status(500).send({
          message: "Could not delete Images with product id " + req.params.id,
        });
        return;
      }
      // If there's no error or if the image was not found (both cases are fine),
      // continue to try to delete the product.
      Products.removeById(req.params.id, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found Products with id ${req.params.id}`,
            });
          } else {
            res.status(500).send({
              message: "Could not delete Products with id " + req.params.id,
            });
          }
        } else {
          res
            .status(200)
            .send({ message: `Product was deleted successfully!` });
        }
      }); // Products.removeById end
    }); // ImageClass.removeByProductId end
  }); // Auth.execIfAuthValid end
};

exports.deleteAll = (req, res) => {
  Auth.execIfAuthValid(req, res, admin, (req, res, user) => {
    Products.removeAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all Products.",
        });
      else
        res
          .status(200)
          .send({ message: `All Products were deleted successfully!` });
    });
  });
};

function isValidProduct(req, res) {
  var categoryArray = [
    "Fashion",
    "Home",
    "Beauty",
    "Books",
    "Electronic",
    "Baby",
  ];
  if (req.body.id) {
    res.status(400).send({
      message: "Id is provided by system, no need to input it",
      result: false,
    });
    return false;
  }

  if (!categoryArray.includes(req.body.category)) {
    res.status(400).send({
      message:
        "Category needs to be Fashion, Home, Beauty, Books, Electronic or Baby",
    });
    return false;
  }

  if (!req.body.sellerId) {
    res.status(400).send({
      message: "No sellerId provided. Please login first",
    });
    return false;
  }

  if (req.body.productCode.length < 1 || req.body.productCode.length > 45) {
    res.status(400).send({
      message: "Product Code needs to be 1-45 characters",
    });

    if (isNaN(req.body.price)) {
      res.status(400).send({
        message: "Price needs to be a number",
      });
      return false;
    }
    let splitPrice = req.body.price.toString().split(".");
    if (splitPrice.length > 1) {
      if (splitPrice[1].length > 2) {
        res.status(400).send({
          message: "Price can have only two decimals",
        });
        return false;
      }
    }
    if (splitPrice[0].length > 8) {
      res.status(400).send({
        message: "Price exceeds site limit",
      });
      return false;
    }
  }

  if (isNaN(req.body.stockNum)) {
    res.status(400).send({
      message: "Stock number needs to be a number",
    });
    return false;
  }

  return true;
}
