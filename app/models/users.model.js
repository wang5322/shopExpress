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
  //get one user by id
Users.findByUsername = (username, result) => {
    // prevent SQL injection
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      if (res.length) {
        console.log("found users: ", res[0]);
        result(null, res[0]);
        return;
      }
  
      // not found user with the id
      result({ kind: "not_found" }, null);
    });
  };
//update user by id
  Users.updateByID = (id, username, result)=>{
    let queryStr = 'UPDATE users SET userName =?, passwords =?, role =?, address =?, email =? WHERE id=?'
    db.query(querystr, [users.userName, users.passwords, users.role, users.address, users.email, id], (err, res)=>{
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
          }
    
          if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
          }
    
          console.log("updated user: ", { id: id, ...users });
          result(null, { id: id, ...users }); 
    });
  };
//delete user by id
  Users.removeById = (id, result) => {
    let queryStr = `DELETE FROM users WHERE id=?`;
    db.query(queryStr, id, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
  
      if (res.affectedRows == 0) {   
        result({ kind: "not_found" }, null);
        return;
      }
  
      console.log("deleted user with id: ", id);
      result(null, res);
    });
  };
  
  module.exports = Users;