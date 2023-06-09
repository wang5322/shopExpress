const User = require("../models/users.model");
const { createHash } = require("crypto");

exports.hash = (string) => {
  return createHash("sha256").update(string).digest("hex");
};

exports.execIfAuthValid = (req, res, role, callIfAuth) => {
  console.log(JSON.stringify(req.headers));
  if (
    req.headers["x-auth-username"] === undefined ||
    req.headers["x-auth-password"] == undefined
  ) {
    console.log("no x-auth-* headers received");
    res.status(403).send({
      message: "Authentication required but not provided",
    });
    return;
  }
  let username = req.headers["x-auth-username"];
  let password = req.headers["x-auth-password"];
  let passwordHash = password; // FIXME: exports.hash(password);
  console.log(
    "Username: " +
      username +
      ", password: " +
      password +
      ", passHash: " +
      passwordHash
  );
  User.findByUsername(username, (err, user) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(403).send({
          message: "Authentication invalid",
        });
      } else {
        res.status(500).send({
          message: "Error retrieving ToDo with id " + req.params.id,
        });
      }
    } else {
      console.log("User found: " + JSON.stringify(user));
      if (user.password == passwordHash) {
        delete user.password;
        if (role !== undefined && role !== null) {
          if (user.role == role) {
            callIfAuth(req, res, user);
          } else {
            res.status(403).send({
              message: "Authentication invalid",
            });
          }
        } else {
          callIfAuth(req, res, user);
        }
      } else {
        res.status(403).send({
          message: "Authentication invalid",
        });
      }
    }
  });
};
