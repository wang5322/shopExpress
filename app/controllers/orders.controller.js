"use strict";

const Orders = require("../models/orders.model");
const OrderItem = require("../models/orderItems.model");
const Products = require("../models/products.model");
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
    if (isAuthorized(req, res) === false) {
        res.status(500).send({ message: "Authentication error!" });
        return;
    }

    let target;
    let from;
    
    if (req.baseUrl == "/api/orders") {
        target = "orders";
        if (req.body.productId) {
            from = "carts";
        } else {
            from = "products";
        }
    } else if (req.baseUrl == "/api/carts") {
        target = "carts";
        from = "products";
    }
    console.log(target, from);
    let sellerId;
    let buyerId;
    let orderId;
    
    
    
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
                buyerId = getUser(req, res).id;//todo: validate buyerId


                let newOrder;
                //write product information into a new cartItem object
                let newOrderItem = new OrderItem({
                    productId: data[0].id,
                    productCode: data[0].productCode,
                    productName: data[0].productName,
                    price: Number(data[0].price),
                    amount: req.body.amount
                
                });

                //select order record
                let queryStr;
                if (target == "carts") {
                    //add item to cart
                    queryStr = `isCart = 1 and sellerId = ${sellerId} and buyerId = ${buyerId}`;
                } else {
                    //add item to order
                    if (from == "products") {
                        //from products
                        queryStr = `isCart = 0 and status is null and sellerId = ${sellerId} and buyerId = ${buyerId}`;
                    } else {
                        //from cart
                        if (!(req.body.productCode == data[0].productCode && req.body.productName == data[0].productName && req.body.price == data[0].price)) {
                            return res.status(500).send({ message: "Cart items does not match the product information!" });
                        } else {
                            queryStr = `isCart = 0 and status is null and sellerId = ${sellerId} and buyerId = ${buyerId}`;
                        }

                    };
                };
            
                Orders.getAll(queryStr, (err, data) => {
                    
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
                            if (target == "carts") { newOrder.isCart = 1; } else { newOrder.isCart = 0; };
                            Orders.create(newOrder, (err, data) => {
                                if (err) {
                                    return res.status(500).send({ message: err.message || "Create failed!" });
                                } else {
                                    orderId = data.id;
                                    newOrder = data;
                                    newOrderItem.orderId = newOrder.id;
                                    OrderItem.create(newOrderItem, (err, data) => {
                                        if (err) {
                                            return res.status(500).send({ message: err.message || (target == "cart" ? "Create cart item failed!" : "Create order item failed!") });
                                        } else {
                                            if (from == "carts") {
                                                //delete cart item when transfered to order
                                                OrderItem.remove(req.body.id, (err, data) => {
                                                    if (err) {
                                                        return res.status(500).send({ message: err.message || "delete from cart failed!" });
                                                    };
                                                });
                                            };
                                            return res.status(200).send({ order: newOrder, orderItem: data });
                                        };
                                    });

                                }
                            });
                        } else {
                            //use the existing order record in orders table
                            orderId = data[0].id;
                            newOrder = data[0];
                            newOrderItem.orderId = newOrder.id;
                            OrderItem.create(newOrderItem, (err, data) => {
                                if (err) {
                                    return res.status(500).send({ message: err.message || (target == "cart" ? "Create cart item failed!" : "Create order item failed!") });
                                } else {
                                    if (from == "carts") {
                                    //delete cart item when transfered to order
                                    OrderItem.remove(req.body.id, (err, data) => {
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
                });
            };
        };
    });
    
}

//validator for requests
function isAuthorized(req, res) {
    return true;
}
function getUser(req, res) {
    return { id: 3, role: "Buyer" };
}