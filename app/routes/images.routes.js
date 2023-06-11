module.exports = (app) => {
  const images = require("../controllers/images.controller.js");

  var router = require("express").Router();

  // Create a new image
  router.post("/", images.create);

  // Retrieve a single image with id
  router.get("/:id([0-9]+)", images.findOne);

  // Retrieve all images
  router.get("/", images.findAll);

  //delete image by id
  router.delete("/:id([0-9]+)", images.delete);

  app.use("/api/images", router);
};
