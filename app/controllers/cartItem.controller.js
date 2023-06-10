"use strict"

const CartItems = require("../models/cartItems.model");
const Products = require("../models/products.model");
const Carts = require("../models/carts.model");
const Auth = require("../utils/auth");

//return true if cartitem matched product information, false if not matched
exports.matchProduct = (req, res) => {
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) {
            return res.status(500).send({ message: "Only buyer can use carts." });
        }//only buyer can use carts
        else {
            Carts.findById(req.body.cartId, (err, data) => {
                if (err) {
                    return res.status(404).send({ message: err.message || "Can not find cart record" });
                } else {
                    if (!data.id) {
                        return res.status(404).send({ message: "Can not find cart record" });
                    } else {
                        if (!(user.id == data.buyerId)) {
                            //buyer can only match his own cartitem
                            return res.status(500).send({ message:"buyer can only match your own cartitem" });
                        } else {
                            Products.getById(req.body.productId, (err, data) => {
                                if (err) {
                                    return res.status(404).send({ message: err.message || "Can not find product record" });
                                } else {
                                    if (!data.id) {
                                        return res.status(404).send({ message: "Can not find product record" });
                                    } else {
                                        if (data.productCode == req.body.productCode && data.productName == req.body.productName && data.price == req.body.price) {
                                            return res.status(200).send({ matched: true });
                                        } else {
                                            return res.status(200).send({ matched: false });
                                        }
                                    }
                                }
                                
                            })//Products.findById end
                        }
                    }
                }
            })//Carts.findById end
            
        };
    });//Auth.execIfAuthValid end
}

//refresh cartitem by original product information
exports.refreshFromProduct = (req, res)=>{
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) {
            return res.status(500).send({ message: "Only buyer can use carts." });
        }//only buyer can use carts
        else {
            Carts.findById(req.body.cartId, (err, data) => {
                if (err) {
                    return res.status(404).send({ message: err.message || "Can not find cart record" });
                } else {
                    if (!data.id) {
                        return res.status(404).send({ message: "Can not find cart record" });
                    } else {
                        if (!(user.id == data.buyerId)) {
                            //buyer can only match his own cartitem
                            return res.status(500).send({ message:"buyer can only refresh your own cartitem" });
                        } else {
                            Products.getById(req.body.productId, (err, data) => {
                                if (err) {
                                    return res.status(404).send({ message: err.message || "Can not find product record" });
                                } else {
                                    if (!data.id) {
                                        return res.status(404).send({ message: "Can not find product record" });
                                    } else {
                                        //write product information into cartitem
                                        req.body.productCode = data.productCode;
                                        req.body.productName = data.productName;
                                        req.body.price = data.price; 
                                        CartItems.updateById(req.body.id, req.body, (err, data) => {
                                            if (err) {
                                                return res.status(500).send({ message: err.message || "refresh failed!" });
                                            } else {
                                                return res.status(200).send(data);
                                            }
                                        })//CartItems.updateById end
                                    }
                                }
                                
                            })//Products.findById end
                        }
                    }
                }
            })//Carts.findById end
            
        };
    });//Auth.execIfAuthValid end
}

//update cartitem amount
exports.updata = (req, res) => {
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) {
            return res.status(500).send({ message: "Only buyer can use carts." });
        }//only buyer can use carts
        else {
            Carts.findById(req.body.cartId, (err, data) => {
                if (err) {
                    return res.status(404).send({ message: err.message || "Can not find cart record" });
                } else {
                    if (!data.id) {
                        return res.status(404).send({ message: "Can not find cart record" });
                    } else {
                        if (!(user.id == data.buyerId)) {
                            //buyer can only match his own cartitem
                            return res.status(500).send({ message:"buyer can only update your own cartitem" });
                        } else {
                            Products.getById(req.body.productId, (err, data) => {
                                if (err) {
                                    return res.status(404).send({ message: err.message || "Can not find product record" });
                                } else {
                                    if (!data.id) {
                                        return res.status(404).send({ message: "Can not find product record" });
                                    } else {
                                        if (data.productCode == req.body.productCode && data.productName == req.body.productName && data.price == req.body.price) {
                                            return res.status(500).send({ message:"Product information doesn't match" });
                                        } else {
                                            CartItems.updateById(req.body.id, req.body, (err, data) => {
                                                if (err) {
                                                    return res.status(500).send({ message: "update error" });
                                                } else {
                                                    return res.status(200).send(data);
                                                }
                                            });//CartItems.updateById
                                        }
                                    }
                                }
                                
                            })//Products.findById end
                        }
                    }
                }
            })//Carts.findById end
            
        };
    });//Auth.execIfAuthValid end
}

//delete cartitem by id
exports.delete = (req, res) => {
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) {
            return res.status(500).send({ message: "Only buyer can use carts." });
        }//only buyer can use carts
        else {
            Carts.findById(req.body.cartId, (err, data) => {
                if (err) {
                    return res.status(404).send({ message: err.message || "Can not find cart record" });
                } else {
                    if (!data.id) {
                        return res.status(404).send({ message: "Can not find cart record" });
                    } else {
                        if (!(user.id == data.buyerId)) {
                            //buyer can only delete his own cartitem
                            return res.status(500).send({ message:"buyer can only delete your own cartitem" });
                        } else {
                            CartItems.remove(req.body.id, (err, data) => {
                                if (err) {
                                    return res.status(500).send({ message: err.message || "delete failed!" });
                                } else {
                                    if (data.affectedRows == 0) {
                                        return res.status(500).send({ message: err.message || "delete failed!" });
                                    } else {
                                        return res.status(200).send({message:"delete successfully"});
                                    }
                                    
                                }
                            })//CartItems.remove end
                        }
                    }
                }
            })//Carts.findById end
            
        };
    });//Auth.execIfAuthValid end
}

