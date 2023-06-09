"use strict";

const db = require("./db");

const Carts = function (carts) {
    this.sellerId = carts.sellerId;
    this.buyerId = carts.buyerId;
    
};

//create a new cart
Carts.create = (newCart, result) => {
    db.query("INSERT INTO carts SET ?", newCart, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        //console.log("created order: ", { id: res.insertId, ...newCart });
        result(null, { id: res.insertId, ...newCart });
      });
}

//get one order by id
Carts.findById = (id, result) => {

    db.query(`SELECT * FROM carts WHERE id = ${id}`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      if (res.length) {
        console.log("found orders: ", res[0]);
        result(null, res[0]);
        return;
      }
      result({ kind: "not_found" }, null);
    });
};
  

//get carts with sellerId , buyerId
Carts.getAll = (sellerId,buyerId, result) => {

    let sql = "SELECT * FROM carts";
    let inserts = [];
    let filterStr;
    if (sellerId) {
        filterStr += " WHERE sellerId = ??";
        inserts.push(sellerId);

    };
    if (buyerId) {
        if (filterStr.length == 0) { filterStr += " WHERE buyerId = ??"; }
        else { filterStr += " AND buyerId = ??"; }
        inserts.push(buyerId);
    };
    
    sql += filterStr;
    let query = db.format(sql, inserts);
    db.query(query, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        };
        result(null, res);
    });
};



//update an cart
Carts.updateById = (id, cart, result) => {
    db.query(
        "UPDATE carts SET sellerId=?, buyerId=?, WHERE id = ?", [cart.sellerId, cart.buyerId,id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(null, err);
                return;
            }
            //problem affectedRows
            if (res.affectedRows == 0) {
                // not found carts with the id
                result({ kind: "not_found" }, null);
                return;
            }
    
            console.log("updated carts: ", { id: id, ...cart });
            result(null, { id: id, ...cart });
        }
    );
};


//delete an order
Carts.remove = (id, result) => {
    db.query("DELETE FROM carts WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
  
        if (res.affectedRows == 0) {
            // not found cart with the id
            result({ kind: "not_found" }, null);
            return;
        }
  
        console.log("deleted carts with id: ", id);
        result(null, res);
    });
};
  
module.exports = Carts;