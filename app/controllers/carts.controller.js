"use strict";

const Carts = require("../models/carts.model");
const CartItem = require("../models/cartItems.model");
const Products = require("../models/products.model");

const Auth = require("../utils/auth");
const { error } = require("npmlog");

exports.getAll = (req, res) => {
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) { return; }//only buyer can get carts
        Carts.getAll( user.id, (err, data) => {
            if (err) {
                res.status(500).send({ message: err.message || "Some error occurred while retrieving carts." });
            } else {
                res.status(200).send(data);
            }
        })
    });//Auth.execIfAuthValid end
};



exports.create = (req, res) => {
    let sellerId;
    let buyerId;
    
    Products.getById(req.body.productId , (err, data) => {
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
                        return res.status(500).send({ message: `Only buyer can add carts!` });
                    } else {let newCarts;
                        //write product information into a new orderitem object
                        let newCartItem = new CartItem({
                            productId: data[0].id,
                            productCode: data[0].productCode,
                            productName: data[0].productName,
                            price: Number(data[0].price),
                            amount: req.body.amount
                
                        });
                        //select existing cart
                        buyerId = user.id;
                        Carts.getAll(buyerId,sellerId, (err, data) => {
                            if (err) {
                                res.status(500).send({ message: err.message || "Create failed!" });
                                return;
                            } else {
                                if (data.length == 0) {
                                    //create a new record to orders table
                                    newCarts = {
                                        sellerId: sellerId,
                                        buyerId: buyerId
                                    }
                                    Carts.create(newCarts, (err, data) => {
                                        if (err) {
                                            return res.status(500).send({ message: err.message || "Create failed!" });
                                        } else {
                                            cartId = data.id;
                                            newCarts = data;
                                            newCartItem.cartId = newCarts.id;
                                            CartItem.create(newCartItem, (err, data) => {
                                                if (err) {
                                                    return res.status(500).send({ message: err.message || ("Create cart item failed!") });
                                                } else {
                                                    return res.status(200).send({ cart: newCarts, cartItem: data });
                                                };
                                            });//CartItem.create end

                                        }
                                    });//Carts.create end
                                } else {
                                    //use the existing cart record in carts table
                                    newCarts = data[0];
                                    newCartItem.cartId = newCarts.id;
                                    CartItem.create(newCartItem, (err, data) => {
                                        if (err) {
                                            return res.status(500).send({ message: err.message || ("Create cart item failed!") });
                                        } else {
                                            return res.status(200).send({ cart: newCarts, cartItem: data });
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

exports.delete = (req, res) => {
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) { return; }//only buyer can delete cart 

        Carts.remove(req.params.id, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found order with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Could not delete cart with id " + req.params.id
                    });
                }
            } else res.status(200).send({ message: true });
        });//Orders.remove end

    })//Auth.execIfAuthValid end
};