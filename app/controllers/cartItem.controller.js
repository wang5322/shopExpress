"use strict"

const CartItems = require("../models/cartItems.model");
const Products = require("../models/products.model");
const Carts = require("../models/carts.model");
const Auth = require("../utils/auth");

//get all cartItems with indicated carts' id in req.body
exports.getAll = (req, res) => {
    //validate id existing in req.body
    if (!(req.body.id)) return res.status(500).send({ message: "id not indicated!" });
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) {
            return res.status(500).send({ message: "Only buyer can use carts." });
        }//only buyer can use carts
        else {
            Carts.findById(req.body.id, (err, data) => {
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
                            CartItems.getByCartId(req.body.id, (err, data) => {
                                if (err) {
                                    return res.status(500).send({ message: err.message || "query failed!" });
                                } else {
                                    return res.status(200).send(data);
                                }
                            })
                        }
                    }
                }
            })//Carts.findById end
            
        };
    });//Auth.execIfAuthValid end
}

//return true if cartitem in req.body matched product information, false if not matched
exports.matchProduct = (req, res) => {
    //if (!isValidateCartItem(req.body)) {return res.status(500).send({ message: "invalidate cartItem" });}
    id = req.params.id;
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) {
            return res.status(500).send({ message: "Only buyer can use carts." });
        }//only buyer can use carts
        else {
            CartItems.userPermitted(id, user.id, (err, data) => {
                if (err) {
                    return res.status(500).send({ message: err.message||"can not check permission" });
                } else {
                    if (data.permitted) {
                        CartItems.matchById(id, (err, data) => {
                            if (err) {
                                return res.status(500).send({ message: err.message||"can not get matched" });
                            } else {
                                return res.status(200).send(data);
                            }
                        })
                    } else {
                        return res.status(500).send({ message: "not permitted" });
                    }
                }
            })//CartItems.userPermitted
        };
    });//Auth.execIfAuthValid end
}

//refresh cartitem by original product information
exports.refreshFromProduct = (req, res) => {
    id = req.params.id;
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        if (!(user.role == "buyer")) {
            return res.status(500).send({ message: "Only buyer can use carts." });
        }//only buyer can use carts
        else {
            CartItems.userPermitted(id, user.id, (err, data) => {
                if (err) {
                    return res.status(500).send({ message: err.message||"can not check permission" });
                } else {
                    if (data.permitted) {
                        CartItems.refreshFromProduct(id, (err, data) => {
                            if (err) {
                                return res.status(500).send({ message: err.message||"refresh failed" });
                            } else {
                                if (data.affectedRows == 0) {
                                    return res.status(500).send({ message:"refresh failed" });
                                } else {
                                    return res.status(200).send({ message:"refresh successfully" });
                                }
                            }
                        })
                    } else {
                        return res.status(500).send({ message: "not permitted" });
                    }
                }
            })//CartItems.userPermitted
            
        };
    });//Auth.execIfAuthValid end
}

//update cartitem attached in req.body
exports.updata = (req, res) => {
    if (!isValidateCartItem(req.body)) {return res.status(500).send({ message: "invalidate cartItem" });}
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

//delete cartitem attached in req.body
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




function isValidateCartItem(cartItem) {
    if (cartItem.cartId && cartItem.productId && cartItem.productCode && cartItem.productName && cartItem.price && cartItem.amount) {
        return true;
    } else { return false };
}