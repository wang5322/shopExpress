"use strict";

const db = require("./db");
const OrderItem = function (orderItem) {
    this.orderId = orderItem.orderId;
    this.productId = orderItem.productId;
    this.productCode = orderItem.productCode;
    this.productName = orderItem.productName;
    this.price = orderItem.price;
    this.amount = orderItem.amount;
};

OrderItem.create = (newOrderItem, result) => {
    db.query("INSERT INTO orderItems SET ?", newOrderItem, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        console.log("created orderItems: ", { id: res.insertId, ...newOrderItem });
        result(null, { id: res.insertId, ...newOrderItem });
    });
};

OrderItem.updateById = (id, orderItem, result) => {
    db.query("UPDATE orderItems set orderId = ?, productId = ?, productCode = ?, productName = ?, price = ?, amount = ? WHERE id = ?", [orderItem.orderId, orderItem.productId, orderItem.productCode, orderItem.productName, orderItem.price, orderItem.amout], (err, res) => {
        if (err) {
            console.log("error:", err);
            result(null, res);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        console.log("updated orderItems: ", { id: id, ...orderItem });
        return;
    })
}

OrderItem.remove = (id, result) => {
    db.query("DELETE FROM orderItems WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        console.log("deleted orderItems with id: ", id);
        result(null, res);
    });
};

OrderItem.getByOrderId = (orderId, result) => {
    db.query("SELECT * FROM orderItems WHERE orderId=?", orderId, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        };
        result(null, res);
    })
};

module.exports = OrderItem;