module.exports = app => {
    
    const products = require("../controllers/products.controller");
  
    let router = require("express").Router();
  
    // Create a new products
    router.post("/", products.create);
  
    // Retrieve all products
    router.get("/", products.findAll);

    // TODO: retrive a specific product
    router.get("/:productName", products.findOne);
  
    app.use('/api/products', router);
  };