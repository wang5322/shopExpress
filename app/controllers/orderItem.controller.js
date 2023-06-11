"use strict"

const OrderItems = require("../models/orderItems.model");
const Products = require("../models/products.model");
const CartItems = require("../models/cartItems.model");
const Carts = require("../models/carts.model");

const Orders = require("../models/orders.model");

const db = require("../models/db");
const Auth = require("../utils/auth");

//add an product or cartitem into an order with an orderId
//json include {id,productId}(from cartItems)/{id}(from products) and {amount,orderId}
exports.addToOrder = (req, res) => {

    let newOrderItem;
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) {
            //not a buyer
        } else {
            //only a buyer can add orderItem
            if ((!req.body.id) || (!req.body.amount)||(!req.body.orderId)) {
                //cannot add to order without id or amount
                return res.status(500).send({ message: "can not find information from request" })
            }
            else {
                if (!(req.body.productId)) {
                    //from product -- only has id, and no productId
                    Products.getById(req.body.id, (err, data) => {
                        if (err) {
                            return res.status(500).send({ message: err.message || "cannot find product with id:" + req.body.id });
                        } else {
                            if (!data.id) {
                                return res.status(500).send({ message: "cannot find product with id:" + req.body.id });
                            } else {
                                newOrderItem = new OrderItems({
                                    orderId: req.body.orderId,
                                    productId: data.id,
                                    productCode: data.productCode,
                                    productName: data.productName,
                                    price: data.price,
                                    amount: req.body.amount
                                });//newOrderItem
                                OrderItems.create(newOrderItem, (err, data) => {
                                    if (err) {
                                        return res.status(500).send({ message: err.message||"error when create orderItem" });
                                    } else {
                                        return res.status(200).send(data);
                                    }//endif

                                })//OrderItems.create end
                            }//endif
                        }//endif
                    })//Products.getById end

                } else {
                    //from cartItem -- has id and productId
                    CartItems.userPermitted(id, user.id, (err, data) => {
                        if (err) {
                            return res.status(500).send({ message: err.message || "can not check permission" });
                        } else {
                            if (!data.permitted) {
                                return res.status(500).send({ message: "not permitted" });
                            } else {
                                CartItems.matchById(id, (err, data) => {
                                    if (err) {
                                        return res.status(500).send({ message: err.message || "matching error" });
                                    } else {
                                        if (!data.matched) {
                                            return res.status(500).send({ message: "cart not matched products" });
                                        } else {
                                            CartItems.getById(id, (err, data) => {
                                                if (err) {
                                                    return res.status(500).send({ message: err.message || "get cartItem error" });
                                                } else {
                                                    if (data.length == 0) {
                                                        return res.status(500).send({ message: "cannot get cartItem " });
                                                    } else {
                                                        newOrderItem = new OrderItems({
                                                            orderId: req.body.orderId,
                                                            productId: data[0].productId,
                                                            productCode: data[0].productCode,
                                                            productName: data[0].productName,
                                                            price: data[0].price,
                                                            amount: data[0].amount
                                                        });
                                                        OrderItems.create(newOrderItem, (err, data) => {
                                                            if (err) {
                                                                return res.status(500).send({ message: err.message||"error when create orderItem" });
                                                            } else {
                                                                return res.status(200).send(data);
                                                            }//endif
                        
                                                        })//OrderItems.create end

                                                    }
                                                }
                                            })//CartItems.getById
                                        }
                                    }
                                })//CartItems.matchById
                            }
                        }
                    })//CartItems.userPermitted

                    /*
                    CartItems.getById(req.body.id, (err, data) => {
                        if (err) {
                            return res.status(500).send({ message: err.message||"cartItem not found" });
                        } else {
                            if (data.length == 0) {
                                return res.status(500).send({ message: "cartItem not found" });
                            } else {
                                Carts.findById(data[0].cartId, (err, data) => {
                                    if (err) {
                                        return res.status(500).send({ message: err.message||"cart not found" });
                                    } else {
                                        if (data.length == 0) {
                                            return res.status(500).send({ message: "cart not found" });
                                        } else {
                                            if (!(data[0].buyerId == user.id)) {
                                                return res.status(500).send({ message: "not your cart" });
                                            } else {
                                                



                                            }
                                        }
                                    }
                                })//Carts.findById end
                            }//endif
                        }//endif
                    })//CartItems.getById end
                    */



                }//endif
            }//endif
        }//endif

    })//Auth.execIfAuthValid end


    
}//exports.addToOrder end

//delete an orderItem from an order
exports.delete= (req, res) => {
    
}

//get all orderItems in an order
exports.getAll= (req, res) => {
    
}

//get one orderItem with id
exports.getOne = (req, res) => {
    
}

//modify amount of an orderItem
exports.modifyAmount= (req, res) => {
    
}



//if orderItem with id match the product 
exports.matchProduct = (req, res) => {
    
    
}

//refresh orderItem with id from product
exports.refreshFromProduct= (req, res) => {
    
}

