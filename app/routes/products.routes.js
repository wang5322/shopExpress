module.exports = (app) => {
  const products = require("../controllers/products.controller");

  let router = require("express").Router();

  // Create new products
  router.post("/", products.create);

  // Retrieve all products(including search for)
  router.get("/", products.findAll);

  //Retrive all products by sellerId
  router.get("/", products.findBySeller);

  //Retrive a product by productId
  router.get("/:id([0-9]+)", products.findOne);

  //update a product by productId
  router.put("/:id([0-9]+)", products.update);

  //update a product using path by productId - used when a client placed an order with the product
  router.patch("/:id([0-9]+)", products.updateStock);

  //delete product by productId
  router.delete("/:id([0-9]+)", products.delete);

  //delete all products
  router.delete("/", products.deleteAll);

  app.use("/api/products", router);
};
