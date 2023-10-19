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
        } else {
            //console.log("created orderItems: ", { id: res.insertId, ...newOrderItem });
            result(null, { id: res.insertId, ...newOrderItem });
        }
        
    });
};

OrderItem.updateById = (id, orderItem, result) => {
    db.query("UPDATE orderItems set orderId = ?, productId = ?, productCode = ?, productName = ?, price = ?, amount = ? WHERE id = ?", [orderItem.orderId, orderItem.productId, orderItem.productCode, orderItem.productName, orderItem.price, orderItem.amount,id], (err, res) => {
        if (err) {
            console.log("error:", err);
            result(err, null);
            return;
        }else {
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
        }else {
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
        }else {
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
        } else {
            result(null, res);
        }
        
    })
};

OrderItem.getById = (id, result) => {
    db.query("SELECT * FROM orderItems WHERE id=?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        } else {
            result(null, res);
        }
        
    })
}

OrderItem.matchById = (id, result) => {
    db.query("select o.id from orderItems as o join products as p on (o.productId = p.id) where (o.productCode <> p.productCode or o.productName <> o.productName or o.price <> p.price) and o.id = ?", id, (err, res) => {
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
    db.query("update orderItems as oi, orders as o, products as p set oi.productCode=p.productCode, oi.productName= p.productName, oi.price = p.price where oi.productId=p.id and oi.orderId= o.id and o.status='unSubmitted' and oi.id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        } else {
            console.log("refreshed orderItem from products");
            result(null, res);
        }
    })
}

//return if user has permission to view the orderItem
OrderItem.userPermitted = (id, userId, userRole, result) => {
    let queryStr = "select * from orderItems as oi join orders as o on oi.orderId=o.id where oi.id = ?";
    let args = [id];
    switch (userRole) {
        case "buyer": {
            queryStr += " and o.buyerId = ?";
            args.push(userId);
            break;
        }
        case "seller": {
            queryStr += " and o.sellerId = ? and o.status <> 'unSubmitted' and o.status <> 'BuyerConfirmed'";
            args.push(userId);
            break;
        }
        case "admin": {
            queryStr += " and o.status <> 'unSubmitted' and o.status <> 'BuyerConfirmed'";
            break;
        }
        default: {
            result(new Error("user role error"), null);
        };
    }

    db.query(queryStr, args, (err, res) => {
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