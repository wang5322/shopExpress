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
        //console.log("created orderItems: ", { id: res.insertId, ...newOrderItem });
        result(null, { id: res.insertId, ...newOrderItem });
    });
};

OrderItem.updateById = (id, orderItem, result) => {
    db.query("UPDATE orderItems set orderId = ?, productId = ?, productCode = ?, productName = ?, price = ?, amount = ? WHERE id = ?", [orderItem.orderId, orderItem.productId, orderItem.productCode, orderItem.productName, orderItem.price, orderItem.amount,id], (err, res) => {
        if (err) {
            console.log("error:", err);
            result(err, null);
            return;
        } else if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        } else {
            console.log("updated orderItems: ", { id: id, ...orderItem });
            result(null, { id: id, ...orderItem });
        }
     
    })
}

OrderItem.remove = (id, result) => {
    db.query("DELETE FROM orderItems WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        } else {
            console.log("deleted orderItems with id: ", id);
            result(null, res);
        }
        
    });
}

OrderItem.removeAll = (OrderId, result) => {
    db.query("delete from orderItems where orderId = ?", OrderId, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        } else {
            console.log("deleted orderItems with orderId: ", OrderId);
            result(null, res);
        }
        
    })
}

OrderItem.getByOrderId = (orderId, result) => {
    db.query("SELECT * FROM orderItems WHERE orderId=?", orderId, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        };
        result(null, res);
    })
};

OrderItem.getById = (id, result) => {
    db.query("SELECT * FROM orderItems WHERE id=?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        };
        result(null, res);
    })
}

OrderItem.matchById = (id, result) => {
    db.query("select o.id from orderitems as o join products as p on (o.productId = p.id) where (o.productCode <> p.productCode or o.productName <> o.productName or o.price <> p.price) and o.id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        } else {
            result(null, { matched: (res.length == 0) ? true : false });
        }
    })
    
}

OrderItem.refreshFromProduct = (id, result) => {
    db.query("update orderitems as oi, orders as o, products as p set oi.productCode=p.productCode, oi.productName= p.productName, oi.price = p.price where oi.orderId= o.id and o.status='unSubmitted' and oi.id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        } else if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        } else {
            console.log("refreshed orderItem from products");
            result(null, res);
        }
    })
}

OrderItem.userPermitted = (id, userId,result) => {
    db.query("select * from orderItems as oi join orders as o on oi.cartId=o.id where oi.id = ? and buyerId = ?", [id,userId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        } else {
            result(null, { permitted: (res.length == 0) ? false : true });
        }
    })
}

module.exports = OrderItem;