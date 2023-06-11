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
        } else {
            //console.log("created cartItems: ", { id: res.insertId, ...newOrderItem });
            result(null, { id: res.insertId, ...newCartItem });
        }
        
    });
}

CartItem.updateById = (id, cartItem, result) => {
    db.query("UPDATE cartItems set cartId = ?, productId = ?, productCode = ?, productName = ?, price = ?, amount = ? WHERE id = ?", [cartItem.cartId, cartItem.productId, cartItem.productCode, cartItem.productName, cartItem.price, cartItem.amount, id], (err, res) => {
        if (err) {
            console.log("error:", err);
            result(err, null);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        } else {
            console.log("updated cartItems: ", { id: id, ...cartItem });
            result(null, { id: id, ...cartItem });
        }
        
    })
}

CartItem.remove = (id, result) => {
    db.query("DELETE FROM cartItems WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
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
            result(err, null);
            return;
        } else if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        } else {
            console.log("deleted cartItems with cartId: ", cartId);
            result(null, res);
        }
  
    });
}

CartItem.getByCartId = (cartId, result) => {
    db.query("SELECT * FROM cartItems WHERE cartId=?", cartId, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        };
        result(null, res);
    })
};

CartItem.getById = (id, result) => {
    db.query("SELECT * FROM cartItems WHERE id=?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        };
        result(null, res);
    })
}

CartItem.matchById = (id, result) => {
    db.query("select c.id from cartitems as c join products as p on (c.productId = p.id) where (c.productCode <> p.productCode or c.productName <> p.productName or c.price <> p.price) and c.id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        } else {
            result(null, { matched: (res.length == 0) ? true : false });
        }
    })
    
}

CartItem.refreshFromProduct = (id, result) => {
    db.query("update cartItems as c , products as p set c.productCode=p.productCode, c.productName= p.productName, c.price = p.price where c.productId = p.id and c.id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        } else if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        } else {
            console.log("refreshed cartItems from products");
            result(null, res);
        }
    })
}

CartItem.userPermitted = (id, userId,result) => {
    db.query("select * from cartItems as ci join carts as c on ci.cartId=c.id where ci.id = ? and buyerId = ?", [id,userId], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        } else {
            result(null, { permitted: (res.length == 0) ? false : true });
        }
    })
}
module.exports = CartItem;