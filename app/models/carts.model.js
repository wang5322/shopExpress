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

    db.query("SELECT * FROM carts WHERE id = ?", [id], (err, res) => {
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
  

//get carts with  buyerId, and optional sellerId 
Carts.getAll = (buyerId, sellerId, result) => {

    let sql = "SELECT carts.*, u1.userName as sellerName, u2.userName as buyerName FROM carts join users as u1 on (carts.sellerId=u1.id and u1.role='seller') join users as u2 on (carts.buyerId=u2.id and u2.role='buyer') where buyerId=?";
    let query;
    if (sellerId) {
        sql += " and sellerId=?";
        query = db.format(sql, [buyerId, sellerId]);
    }
    else {
        query = db.format(sql, buyerId);
    }
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