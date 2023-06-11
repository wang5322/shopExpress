const User = require("../models/users.model");
const Auth = require("../utils/auth");

//Create and Save a new User
exports.create = (req, res) => {
  Auth.regIfInputValid(req, res, (req, res) => {
    // Create a User
    // TODO: encrypt the password SHA256
    const user = new User({
      userName: req.body.username,
      password: req.body.password,
      role: req.body.role,
      address: req.body.address,
      email: req.body.email,
    }); // FIXME: HASH PASSWORD

    // Save user in the database
    User.create(user, (err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the user.",
        });
      else {
        delete data["password"];
        res.status(201).send(data);
      }
    });
  });
};
//get user by username
exports.findOne = (req, res) => {
  // if the accessing user is not an admin, he/she can only find his/her own info
  if (
    req.headers["x-auth-role"] !== "admin" &&
    req.headers["x-auth-username"] != req.params.username
  ) {
    res.status(403).send({
      message: "Access Forbidden! You can only pull your own user info",
    });

    return;
  }

  Auth.execIfAuthValid(req, res, "admin", (req, res, user) => {
    User.findByUsername(req.params.username, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "Not found the user with username " + req.params.username,
          });
        } else {
          res.status(500).send({
            message:
              "Error retrieving user with username " + req.params.username,
          });
        }
      } else {
        if (
          data.role === "admin" &&
          req.params.username != req.headers["x-auth-username"]
        ) {
          res.status(403).send({
            message:
              "Access Forbidden! Admin cannot view another admin's information",
          });
        } else {
          res.status(200).send(data);
        }
      }
    });
  });
};

// login
exports.login = (req, res) => {
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    User.findByUsername(req.headers["x-auth-username"], (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "Not found the user with username " + req.params.username,
          });
        } else {
          res.status(500).send({
            message:
              "Error retrieving user with username " + req.params.username,
          });
        }
      } else res.status(200).send(data);
    });
  });
};

//update user by username
exports.update = (req, res) => {
  let role = req.headers["x-auth-role"];
  Auth.execIfAuthValid(req, res, role, (req, res, user) => {
    User.updateByUsername(req.params.username, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "Not found the user with usename " + req.params.username,
          });
        } else {
          res.status(500).send({
            message: "Error updating user with username " + req.params.username,
          });
        }
      } else res.status(200).send(data);
    });
  });
};

//delete user by username
exports.delete = (req, res) => {
  Auth.execIfAuthValid(req, res, "admin", (req, res, user) => {
    User.findByUsername(req.params.username, (err, data) => {
      if (err) {
        res.send({ message: err.message });
      } else {
        if (data.role === "admin") {
          res.status(403).send({
            message: "Access Forbidden: Only root can delete an admin!",
          });
        } else {
          User.removeById(req.params.username, (err, data) => {
            if (err) {
              if (err.kind === "not_found") {
                res.status(404).send({
                  message:
                    "Not found user with username " + req.params.username,
                });
              } else {
                res.status(500).send({
                  message:
                    "Could not delete user with username " +
                    req.params.username,
                });
              }
            } else
              res
                .status(200)
                .send({ message: `User was deleted successfully!` });
          });
        }
      }
    });
  });
};
