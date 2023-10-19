const ImageClass = require("../models/images.model");
const Auth = require("../utils/auth");
const allowedMimeTypes = ["image/jpeg", "image/png"];
//Create and Save a new Todo
exports.create = (req, res) => {
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Content can not be empty!",
      });
    }

    // Check if the mime type is valid
    if (!allowedMimeTypes.includes(req.body.mimeType)) {
      return res.status(400).send({
        message: "Invalid file type. Only jpeg, png are allowed",
      });
    }

    // Check if title and productId is provided
    if (!req.body.title || !req.body.productId) {
      return res.status(400).send({
        message: "Image title and product Id must be provided",
      });
    }

    // console.log("REQ BODY: " + JSON.stringify(req.body)); // careful, you'll print out the whole uploaded file, can be hundreds of lines of text
    const item = new ImageClass({
      title: req.body.title,
      data: Buffer.from(req.body.data, "base64"), // decode base64 to binary data for storage
      mimeType: req.body.mimeType || "Pending",
      productId: req.body.productId || null,
    });

    // Save image in the database
    ImageClass.create(item, (err, item) => {
      if (err) {
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
          res.status(400).send({
            message: "The product id doesn't exist.",
          });
        } else if (err.code === "ER_DUP_ENTRY") {
          res.status(400).send({
            message:
              "Duplicate entry. The item already exists in the database.",
          });
        } else {
          res.status(500).send({
            message:
              err.message ||
              "Internal error occurred while creating this document.",
          });
        }
      } else {
        res.status(201).send(item);
      }
    });
  });
};

// Retrieve all images from the database (with condition).
exports.findAll = (req, res) => {
  const validSortOrders = ["id", "title", "mimeType"];
  const sortOrder = req.query.sortOrder ? req.query.sortOrder : "id"; // sort by id if no sortOrder provided
  const productId = req.query.productId ? req.query.productId : null;
  if (!validSortOrders.includes(sortOrder)) {
    res.status(400).send({
      message: "invalid sort order value",
    });
    return;
  }
  ImageClass.getAll(productId, sortOrder, (err, list) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Images.",
      });
    else res.status(200).send(list);
  });
};

//Find a single Image by the id
exports.findOne = (req, res) => {
  ImageClass.findById(req.params.id, (err, item) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found ToDo with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving ToDo with id " + req.params.id,
        });
      }
    } else {
      // Note: by sending this header you can force download instead of display. filename is optional
      // Content-Disposition: attachment; filename="filename.jpg"
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
      res.contentType(item.mimeType).status(200).send(item.data);
    }
  });
};

exports.delete = (req, res) => {
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    ImageClass.removeByProductId(req.params.id, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Images with product id ${req.params.id}`,
          });
        } else {
          res.status(500).send({
            message: "Could not delete Images with product id " + req.params.id,
          });
        }
      } else
        res.status(200).send({ message: `Product was deleted successfully!` });
    });
  }); // Auth.execIfAuthValid end
};
