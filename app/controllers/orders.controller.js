"use strict";

const Orders = require("../models/orders.model");
const OrderItem = require("../models/orderItems.model");
const Products = require("../models/products.model");
const CartItem = require("../models/cartItems.model");
const Auth = require("../utils/auth");
const { error } = require("npmlog");

exports.getTest = (req, res) => {
    for (let i = 0; i < 40; i++){
        getProductById(i)
            .then(
                (data) => { console.log(data); },
                (err) => { console.log(err); }
            
            );
            
        }
    
    
    
}



exports.create = (req, res) => {
    /*if (isAuthorized(req, res) === false) {
        res.status(500).send({ message: "Authentication error!" });
        return;
    }*/
    let from;
    let cartIdForDel;
    let sellerId;
    let buyerId;
    if (req.body.productId) {
        from = "carts"; 
        cartIdForDel= req.body.cartId;
    } else {
        from = "products";
    };
    
    Products.getById(from == "carts" ? req.body.productId : req.body.id, (err, data) => {
        //get product record from products table
        if (err) {
            return res.status(500).send({ message: err.message || "errors when demanding products" });
        } else {
            if (data.length == 0) {
                res.status(500).send({ message: "Cannot find products!" });
                return;
            } else {
                sellerId = data[0].sellerId;
                Auth.execIfAuthValid(req, res, null, (req, res, user) => {
                    
                    if (!(user.role == "buyer")) {
                        return res.status(500).send({ message: `Only buyer can add order!` });
                    } else {
                        buyerId = user.id;
                        let newOrder;
                        //write product information into a new orderitem object
                        let newOrderItem = new OrderItem({
                            productId: data[0].id,
                            productCode: data[0].productCode,
                            productName: data[0].productName,
                            price: Number(data[0].price),
                            amount: req.body.amount
                
                        });

                        if (from == "carts") {
                            if (!(req.body.productCode == data[0].productCode && req.body.productName == data[0].productName && req.body.price == data[0].price)) {
                                return res.status(500).send({ message: "Cart items does not match the product information!" });
                            };
                        }

                        //select existing unSubmitted order 
                        Orders.getAll(sellerId, buyerId, "unSubmitted", (err, data) => {
                            if (err) {
                                res.status(500).send({ message: err.message || "Create failed!" });
                                return;
                            } else {
                                if (data.length == 0) {
                                    //create a new record to orders table
                                    newOrder = {
                                        sellerId: sellerId,
                                        buyerId: buyerId
                                    }
                                    Orders.create(newOrder, (err, data) => {
                                        if (err) {
                                            return res.status(500).send({ message: err.message || "Create failed!" });
                                        } else {
                                            orderId = data.id;
                                            newOrder = data;
                                            newOrderItem.orderId = newOrder.id;
                                            OrderItem.create(newOrderItem, (err, data) => {
                                                if (err) {
                                                    return res.status(500).send({ message: err.message || ("Create order item failed!") });
                                                } else {
                                                    if (from == "carts") {
                                                        //delete cart item when transfered to order
                                                        CartItem.remove(req.body.id, (err, data) => {
                                                            if (err) {
                                                                return res.status(500).send({ message: err.message || "delete from cart failed!" });
                                                            };
                                                        });
                                                    } 
                                                };
                                            });//OrderItem.create end

                                        }
                                    });//Orders.create end
                                } else {
                                    //use the existing order record in orders table
                                    //orderId = data[0].id;
                                    newOrder = data[0];
                                    newOrderItem.orderId = newOrder.id;
                                    OrderItem.create(newOrderItem, (err, data) => {
                                        if (err) {
                                            return res.status(500).send({ message: err.message || ("Create order item failed!") });
                                        } else {
                                            if (from == "carts") {
                                                //delete cart item when transfered to order
                                                CartItem.remove(req.body.id, (err, data) => {
                                                    if (err) {
                                                        return res.status(500).send({ message: err.message || "delete from cart failed!" });
                                                    };
                                                });
                                            } else {
                                                return res.status(200).send({ order: newOrder, orderItem: data });
                                            };
                                    
                                    
                                        };
                                    });
                                
                                };
                            }
                        });//Orders.getAll end

                        
                    }
                });//Auth.execIfAuthValid end
                
            };
        };
    });//Products.getById end
    
}

