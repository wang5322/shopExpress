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
          if (user.role == role || role.includes(user.role)) {
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

exports.regIfInputValid = (req, res, callIfValid) => {
  if (req.body.id) {
    res.status(400).send({
      message: "id is provided by the system. User not saved",
      result: false,
    });

    return false;
  }

  if (req.body.username === undefined || req.body.password === undefined) {
    res.status(400).send({ message: "username and password must be provided" });
    return false;
  }
  // FIXME: verify quality of password (length 8+, at least one uppercase, lowercase, digit, and special character)
  // FIXME: username must not exist yet, check database, may require you add a callback to this method instead of returning a value
  let username = req.body.username;
  if (!username.match(/^[a-zA-Z0-9_]{5,45}$/)) {
    res.status(400).send({
      message:
        "username must be 5-45 characters long made up of letters, digits and underscore",
    });
    return false;
  }

  User.findByUsername(username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        callIfValid(req, res);
      } else {
        res.status(500).send({
          message: err.message || 'Error retrieving user with username ' + username + 'during input validation'
        });
        return false;
      }
    } else {
      res.status(400).send({
        message:
          "username already exists! Please register with another username.",
      });
      return false;
    }
  });
}

