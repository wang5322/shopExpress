const Products = require("../models/products.model");

exports.create = (req, res) => {
  if (!req.body) {
    res.status.send({ message: "content can not be empty!" });
  }

  const product = new Products({
    category: req.body.category,
    sellerId: req.body.sellerId,
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
          message: err.message || "Duplicate entry for key 'products.PRIMARY'",
        });
      } else {
        res.status(500).send({
          message:
            err.message || "some error occured while creating the product.",
        });
      }
    } else res.send(data);
  });
};

exports.findAll = (req, res) => {
  const category = req.query.category ? req.query.category : null;
  const searchFor = req.query.searchFor ? req.query.searchFor : null;
  console.log(req.query);
  Products.getAll(category, searchFor, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Products.",
      });
    else res.status(200).send(data);
  });
};

exports.findOne = (req, res) => {
  const id = req.params.id;
  console.log(req.query);
  Products.getOne(id, (err, data) => {
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
};
