const User = require("../models/users.model");
const Auth = require("../utils/auth");

//Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  var isValidResult = isUserValid(req, res);
  if (isValidResult === true) {
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
  }
};
//get user by username
exports.findOne = (req, res) => {
    Auth.execIfAuthValid(req, res, 'admin', (req, res, user) => {
        User.findByUsername(req.params.username, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: 'Not found the user with username ' + req.params.username
                    });
                } else {
                    res.status(500).send({
                        message: 'Error retrieving user with username ' + req.params.username
                    });
                }
            } else res.status(200).send(data);
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
                        message: 'Not found the user with username ' + req.params.username
                    });
                } else {
                    res.status(500).send({
                        message: 'Error retrieving user with username ' + req.params.username
                    });
                }
            } else res.status(200).send(data);
        });
    });
};

//update user by username
exports.update = (req, res) => {
    let role = req.headers['x-auth-role'];
    Auth.execIfAuthValid(req, res, role, (req, res, user) => {
        User.updateByID( req.params.username, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: 'Not found the user with usename ' + req.params.username
                    });
                } else {
                    res.status(500).send({
                        message: 'Error updating user with username ' + req.params.username
                    });
                }
            } else res.status(200).send(data);
        });
    });
};

//delete user by username
exports.delete=(req, res)=>{
    Auth.execIfAuthValid(req, res, null, (req, res, user)=>{
        User.removeById(req.params.username,(err, data)=>{
            if (err) {
                if (err.kind === "not_found") {
                  res.status(404).send({
                    message: 'Not found user with username ' + req.params.username,
                  });
                } else {
                  res.status(500).send({
                    message: 'Could not delete user with username ' + req.params.username,
                  });
                }
              } else
                res.status(200).send({ message: `User was deleted successfully!` });
        })
    })
}

// used by insert and update
function isUserValid(req, res) {
  //console.log("isValid: ",res);
  if (req.body.id) {
    res.status(400).send({
      message: "id is provided by the system. User not saved",
      result: false,
    });
    //console.log("if cond: ",res.send.result);
    return false;
  }
  // console.log(JSON.stringify(req.body));
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
  return true;
}
