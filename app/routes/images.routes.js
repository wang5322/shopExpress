module.exports = (app) => {
  const images = require("../controllers/images.controller.js");

  var router = require("express").Router();

  // Create a new document
  router.post("/", images.create);

  // Retrieve a single document with id
  router.get("/:id([0-9]+)", images.findOne);

  // Retrieve all docs
  router.get("/", images.findAll);

  app.use("/api/images", router);
};
