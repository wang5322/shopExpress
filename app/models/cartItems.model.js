"use strict";

const db = require("./db");
const CartItem = function (cartItem) {
    this.cartId = cartItem.cartId;
    this.productId = cartItem.productId;
    this.productCode = cartItem.productCode;
    this.productName = cartItem.productName;
    this.price = cartItem.price;
    this.amount = cartItem.amount;
};

CartItem.create = (newCartItem, result) => {
    db.query("INSERT INTO cartItems SET ?", newCartItem, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        //console.log("created cartItems: ", { id: res.insertId, ...newOrderItem });
        result(null, { id: res.insertId, ...newCartItem });
    });
};

CartItem.updateById = (id, cartItem, result) => {
    db.query("UPDATE cartItems set cartId = ?, productId = ?, productCode = ?, productName = ?, price = ?, amount = ? WHERE id = ?", [cartItem.cartId, cartItem.productId, cartItem.productCode, cartItem.productName, cartItem.price, cartItem.amount], (err, res) => {
        if (err) {
            console.log("error:", err);
            result(null, res);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        console.log("updated orderItems: ", { id: id, ...cartItem });
        return;
    })
}

CartItem.remove = (id, result) => {
    db.query("DELETE FROM cartItems WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        console.log("deleted cartItems with id: ", id);
        result(null, res);
    });
};

CartItem.removeAll = (cartId, result) => {
    db.query("delete from cartItems where cartId = ?", cartId, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        };
        console.log("deleted cartItems with cartId: ", cartId);
        result(null, res);
    })
}

CartItem.getByCartId = (cartId, result) => {
    db.query("SELECT * FROM cartItems WHERE cartId=?", cartId, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        };
        result(null, res);
    })
};

module.exports = CartItem;