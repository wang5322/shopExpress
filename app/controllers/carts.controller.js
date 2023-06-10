"use strict";

const Carts = require("../models/carts.model");
const CartItem = require("../models/cartItems.model");
const Products = require("../models/products.model");

const Auth = require("../utils/auth");
const { error } = require("npmlog");

//get all carts from particular user
exports.getAll = (req, res) => {
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) {
            return res.status(500).send({ message: "Only buyer can get carts." });
        }//only buyer can get carts
        else {
            //get user's all carts
            Carts.getAll(user.id, null, (err, data) => {
                if (err) {
                    res.status(500).send({ message: err.message || "Some error occurred while retrieving carts." });
                } else {
                    res.status(200).send(data);
                }
            });
        };
    });//Auth.execIfAuthValid end
};

//insert posted product into cartItems table, using cart in carts table if existing, else create a new cart  
exports.create = (req, res) => {
    let sellerId;
    let buyerId;
    
    
    Products.getById(req.body.id , (err, data) => {
        //get product record from products table
        if (err) {
            return res.status(500).send({ message: err.message || "errors when demanding products" });
        } else {
            if (!(data.id)) {
                res.status(500).send({ message: "Cannot find products!" });
                return;
            } else {
                
                sellerId = data.sellerId;
                Auth.execIfAuthValid(req, res, null, (req, res, user) => {
                    
                    if (!(user.role == "buyer")) {
                        return res.status(500).send({ message: `Only buyer can add carts!` });
                    } else {let newCarts;
                        //write product information into a new orderitem object
                        let newCartItem = new CartItem({
                            productId: data.id,
                            productCode: data.productCode,
                            productName: data.productName,
                            price: Number(data.price),
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
                                    //no existing cart, insert a new cart into carts table
                                    newCarts = {
                                        sellerId: sellerId,
                                        buyerId: buyerId
                                    }
                                    Carts.create(newCarts, (err, data) => {
                                        if (err) {
                                            return res.status(500).send({ message: err.message || "Create failed!" });
                                        } else {
                                            newCarts = data[0];
                                            newCartItem.cartId = data.id;
                                            CartItem.create(newCartItem, (err, data) => {
                                                //insert cartItem into cartItems table
                                                if (err) {
                                                    return res.status(500).send({ message: err.message || ("Create cart item failed!") });
                                                } else {
                                                    return res.status(200).send({ cart: newCarts, cartItem: data });
                                                };
                                            });//CartItem.create end

                                        }
                                    });//Carts.create end
                                } else {
                                    //use the existing cart in carts table
                                    newCarts = data[0];
                                    newCartItem.cartId = newCarts.id;
                                    CartItem.create(newCartItem, (err, data) => {
                                        //insert cartItem into cartItems table
                                        if (err) {
                                            return res.status(500).send({ message: err.message || ("Create cart item failed!") });
                                        } else {
                                            return res.status(200).send({ cart: newCarts, cartItem: data });
                                        };
                                    });//CartItem.create end
                                
                                };
                            }
                        });//Orders.getAll end

                        
                    }
                });//Auth.execIfAuthValid end
                
            };
        };
    });//Products.getById end
    
}

//delete carts by id, and delete all items with indicated cartId
exports.delete = (req, res) => {
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) { return; }//only buyer can delete cart 
        Carts.findById(req.params.id,(err, data) => {
            //get indicated cart
            if (err) {
                res.status(500).send({
                    message: "Could not delete cart with id " + req.params.id
                });
            } else if (!(data.id)) {
                //no cart record returned
                res.status(404).send({
                    message: `Not found cart with id ${req.params.id}.`
                });
            } else if (!(data.buyerId == user.id)) {
                //buyer can only delete his own cart
                res.status(500).send({
                    message: "Permission denied on deleting cart with id " + req.params.id
                });
            } else {
                CartItem.removeAll(req.params.id, (err, data) => {
                    //delete all cartItems from cartItems table with indicated cartId
                    if (err) {
                        res.status(500).send({
                            message: "Could not delete cartItems with cartId " + req.params.id
                        });
                    } else {
                        Carts.remove(req.params.id, (err, data) => {
                            //delete cart from carts table
                            if (err) {
                                res.status(500).send({
                                        message: "Could not delete cart with id " + req.params.id
                                });
                            } else res.status(200).send({ message: true });
                        });//Carts.remove end
                    }
                })//CartItem.removeAll end
            }
        })//Carts.getById end
    })//Auth.execIfAuthValid end
};