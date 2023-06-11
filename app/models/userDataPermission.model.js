"use strict"

db = require("./db");
const UserDataPermission = function (udp) { 
    this.queryStr = udp.queryStr;
    this.args = udp.args;
 };

UserDataPermission.userPermission = (newUDP, result) => {
    db.query(newUDP.queryStr, newUDP.args, (err, res) => {
        if (err) {
            console.log("userPermission err: " + err.message);
            result(err, null);
            return;
        } else {
            result(null, res);
        }
    })
    
}
module.exports = UserDataPermission;