module.exports = app => {
    
    const products = require("../controllers/products.controller.js");
  
    let router = require("express").Router();
  
    // Create a new products
    router.post("/", products.create);
  
    // Retrieve all products
    router.get("/", products.findAll);
  

  
    app.use('/api/products', router);
  };