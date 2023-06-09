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
    
    if (req.baseUrl == "/api/orders") {
        //make a new order
        switch (req.body.from) {
            //make a new order from cart
            case "cart":
                break;
            
            //make a new order from products
            case "products":

                break;
            default:
                res.status(500).send({ message: "error request!" });
                return;
        }

        
        res.status(500).send("make order from products");


        
    
    
    
    
    
    
    } else if (req.baseUrl == "/api/carts") {
        //put products to carts
        let sellerId;
        let buyerId;
        let cartId;
        Products.getById(req.body.id, (err, data) => {
            //get product record from products table
            if (err) {
                res.status(500).send({ message: err.message || "errors when demanding products" });
                return;
            } else {
                if (data.length == 0) {
                    res.status(500).send({ message: "Cannot find products!" });
                    return;
                };
                sellerId = data[0].sellerId;
                buyerId = getUser(req, res).id;//todo: validate buyerId


                let cartOrder;
                //write product information into a new cartItem object
                let newCartItem = new OrderItem({
                    productId: data[0].id,
                    productCode: data[0].productCode,
                    productName: data[0].productName,
                    price: Number(data[0].price),
                    amount: req.body.amount
                    
                });

                //select cart record
                Orders.getAll(`isCart = 1 and sellerId = ${sellerId} and buyerId = ${buyerId}`, (err, data) => {
                    if (err) {
                        res.status(500).send({ message: err.message || "Create cart failed!" });
                        return;
                    } else {
                        if (data.length == 0) {
                            //create a new cart record to orders table
                            Orders.create({ sellerId: sellerId, buyerId: buyerId, isCart: 1 }, (err, data) => {
                                if (err) {
                                    res.status(500).send({ message: err.message || "Create cart failed!" });
                                } else {
                                    cartId = data.id;
                                    cartOrder = data;
                                }
                            });
                        } else {
                            //use the existing cart record in orders table
                            cartId = data[0].id;
                            cartOrder = data[0];
                                
                        };
                        //add cart item to orderItems table
                        newCartItem.orderId = cartId;
                        OrderItem.create(newCartItem, (err, data) => {
                            if (err) {
                                res.status(500).send({ message: err.message || "Create cart item failed!" });
                            } else {
                                res.status(200).send({ cartOrder: cartOrder, cartItem: newCartItem });
                            }
                        })
                    }
                });
            }
        });
    } else {
        req.status(400).send({ message: "error request!" });
        return;
    };
    
    
}

//validator for requests
function isAuthorized(req, res) {
    return true;
}
function getUser(req, res) {
    return { id: 3, role: "Buyer" };
}