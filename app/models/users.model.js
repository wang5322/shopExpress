const db = require("./db.js");
// constructor
const Users = function (user) {
    this.userName = user.userName;
    this.password = user.password;
    this.role = user.role;
    this.address = user.address;
    this.email = user.email;
  };
  
  //create a user
  Users.create = (newUser, result) => {
    db.query("INSERT INTO users SET ?", newUser, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      console.log("created user: ", { id: res.insertId, ...newUser });
      result(null, { id: res.insertId, ...newUser });
    });
  };
  //get one user by username
Users.findByUsername = (username, result) => {
    // prevent SQL injection
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      if (res.length) {
        result(null, res[0]);
        return;
      }
  
      // not found user with the id
      result({ kind: "not_found" }, null);
    });
  };
//update user by username
Users.updateByUsername = (username, dataObj, result) => {
  let queryStr = 'UPDATE users SET ? WHERE userName =?';
  db.query(queryStr, [dataObj, username], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("updated user: ", { ...res });
    result(null, { ...res });
  });
};

//delete user by id
Users.removeById = (username, result) => {
  let queryStr = `DELETE FROM users WHERE username =?`;
  db.query(queryStr, username, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted user ", username);
    result(null, res);
  });
};

module.exports = Users;