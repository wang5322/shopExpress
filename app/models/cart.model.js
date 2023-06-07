"use strict";

const db = require("./db");
const Cart = function (cart) {
    this.sellerId = cart.sellerId;
    this.buyerId = cart.buyerId;
};

Cart.create = function (newCart,result) {
    db.query("INSERT INTO ORDERS SET ?", newCart, (err,res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        console.log("created cart: ", { id: res.insertId, ...newCart });
        result(null, { id: res.insertId, ...newCart });
    })

};


module.exports = Cart;
