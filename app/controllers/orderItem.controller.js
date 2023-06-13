"use strict"

const OrderItems = require("../models/orderItems.model");
const Products = require("../models/products.model");
const CartItems = require("../models/cartItems.model");
const Carts = require("../models/carts.model");

const Orders = require("../models/orders.model");

const db = require("../models/db");
const Auth = require("../utils/auth");
const orderItemRoutes = require("../routes/orderItem.routes");

//add an product or cartitem into an order with an orderId
//json include {id,productId}(from cartItems)/{id}(from products) and {amount,orderId}
exports.addToOrder = (req, res) => {

    let newOrderItem;
    
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        //only a buyer can add orderItem
        if (!(user.role == "buyer")) {
            //no permission
            return res.status(500).send({ message: "no permission to add orderitem" })
        } else {
            //cannot add to order without id or amount
            if ((!req.body.id) || (!req.body.amount) || (!req.body.orderId)) {
                return res.status(500).send({ message: "can not find information from request" })
            }

            else {
                //only unSubmitted order can be modified
                Orders.getById(req.body.orderId, (err, data) => {
                    if (err) {
                        return res.status(500).send({ message: err.message || "order not found" })
                    } else {
                        if (data.length == 0) {
                            return res.status(500).send({ message: "order not found" })
                        } else {
                            if (!(data[0].status == "unSubmitted")) {
                                return res.status(500).send({ message: "order can not be modified" })
                            } else {
                                //add to order
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
                                                });
                                                //newOrderItem
                                                OrderItems.create(newOrderItem, (err, data) => {
                                                    if (err) {
                                                        return res.status(500).send({ message: err.message || "error when create orderItem" });
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
                                                //only matched cartItem can be add to order
                                                CartItems.matchById(id, (err, data) => {
                                                    if (err) {
                                                        return res.status(500).send({ message: err.message || "matching error" });
                                                    } else {
                                                        if (!data.matched) {
                                                            return res.status(500).send({ message: "cart not matched products" });
                                                        } else {
                                                            //make new orderItem from cartItem
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
                                                                        //new orderItem
                                                                        OrderItems.create(newOrderItem, (err, data) => {
                                                                            if (err) {
                                                                                return res.status(500).send({ message: err.message || "error when create orderItem" });
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
                                    
                                }//endelse
                            }
                        }
                    
                    }//endelse

                });//Orders.getById

            }//endelse
        }//endif

    })//Auth.execIfAuthValid end


    
}//exports.addToOrder end

//delete an orderItem from an order
exports.delete = (req, res) => {
    //validate user
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        //only a buyer or admin can delete orderItem
        if (user.role == "admin") {
            //admin delete an orderItem
            OrderItems.remove(req.params.id, (err, data) => {
                if (err) {
                    return res.status(500).send({ message: err.message || "delete orderItem failed" })
                } else {
                    if (data.affectedRows == 0) {
                        return res.status(500).send({ message: "delete orderItem failed" })
                    } else {
                        return res.status(200).send(data)
                    }
                }
            })//OrderItems.remove end
            //buyer delete an orderItem
        } else if (user.role == "buyer") {
            //validata buyer match the order
            OrderItems.userPermitted(req.params.id, user.id,user.role, (err, data) => {
                if (err) {
                    return res.status(500).send({ message: err.message || "no permission to delete orderitem" })
                } else {
                    if (data.permitted == false) {
                        return res.status(500).send({ message: "no permission to delete orderitem" })
                    } else {
                        //only unSubmitted orderItem can be deleted --BuyerConfirmed can be delete in orders controller
                        Orders.findByOrderItemId(req.params.id, (err, data) => {
                            if (err) {
                                return res.status(500).send({ message: err.message || "order not found" })
                            } else {
                                if (data.length == 0) {
                                    return res.status(500).send({ message: "order not found" })
                                } else {
                                    if (!(data[0].status == "unSubmitted")) {
                                        return res.status(500).send({ message: "not permitted to delete orderitem in status: " + data[0].status })
                                    } else {
                                        //buyer delete an orderItem
                                        OrderItems.remove(req.params.id, (err, data) => {
                                            if (err) {
                                                return res.status(500).send({ message: err.message || "delete orderItem failed" })
                                            } else {
                                                if (data.affectedRows == 0) {
                                                    return res.status(500).send({ message: "delete orderItem failed" })
                                                } else {
                                                    return res.status(200).send(data)
                                                }
                                            }
                                        })//OrderItems.remove end
                                    }
                                }
                            }
                            
                        
                        })//Orders.findByOrderItemId
                    }

                }
            })//OrderItems.userPermitted
        } else {
            return res.status(500).send({ message: "no permission to delete orderitem" })
        }//end if user role

    })//Auth.execIfAuthValid
}
    
//get all orderItems in an order --maybe not needed
exports.getAllByOrderId = (req, res) => {
    //validate id existing in req.body
    //if (!(req.body.id)) return res.status(500).send({ message: "id not indicated!" });
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        //user permitted
        Orders.userPermitted(req.params.id, user.id, user.role, (err, data) => {
            if (err) {
                return res.status(500).send({ message:err.message|| "get permission failed" })
            } else {
                if (!(data.permitted)) {
                    return res.status(500).send({ message: "no permission to get orderitems" })
                } else {
                    //get orderItems by order id
                    OrderItems.getByOrderId(req.params.id, (err, data) => {
                        if (err) {
                            return res.status(500).send({ message: err.message||"get orderitems failed" })
                        } else {
                            return res.status(200).send(data);
                        }
                    })//OrderItems.getByOrderId
                }
            }
    
        })//Orders.userPermitted




            
  




    });//Auth.execIfAuthValid end
}


//get one orderItem with id
exports.getOne = (req, res) => {
    //validate user
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        //buyer or seller can only get their own orderItem
        OrderItems.userPermitted(req.params.id, user.id, user.role, (err, data) => {
            if (err) {
                return res.status(500).send({ message: err.message || "get permission failed" })
            } else {
                if (data.permitted == false) {
                    return res.status(500).send({ message: "not permitted" })
                } else {
                    OrderItems.getById(req.params.id, (err, data)=>{
                        if (err) {
                            return res.status(500).send({ message: err.message || "get orderItem failed" })
                        } else {
                            return res.status(200).send(data);
                        }
                    })//OrderItems.getById end
                }
            }
        })//OrderItems.userPermitted

    })//Auth.execIfAuthValid
}

//modify amount of an orderItem
exports.modifyAmount = (req, res) => {
    
    //validata req
    if (!(req.body.amount)) {
        return res.status(500).send({ message: "no amount" })
    } else {
        //validate user
        Auth.execIfAuthValid(req, res, null, (req, res, user) => {
            //get Order
            Orders.findByOrderItemId(req.params.id, (err, data) => {
                if (err) {
                    return res.status(500).send({ message: err.message || "get order failed" })
                } else {
                    if (data.length == 0) {
                        return res.status(500).send({ message: "get order failed" })
                    } else {
                        if (!(data[0].buyerId == user.id && data[0].status == "unSubmitted")) {
                            return res.status(500).send({ message: "modify not permitted" })
                        } else {
                            OrderItems.getById(req.params.id, (err, data) => {
                                if(err) {
                                    return res.status(500).send({ message:err.message|| "get order item failed" })
                                } else {
                                    if (data.length == 0) {
                                        return res.status(500).send({ message: "get order item failed" })
                                    } else {
                                        let orderItem = data[0];
                                        orderItem.amount = req.body.amount;
                                        //modify amount
                                        OrderItems.updateById(req.params.id, orderItem, (err, data) => {
                                            if (err) {
                                                return res.status(500).send({ message:err.message|| "updated failed" })
                                            } else {
                                                return res.status(200).send(data);
                                            }
                                        })//OrderItems.updateById
                                    }
                                }
                            })//OrderItems.getById
                        
                        }
                    }
                }

            })//Orders.findByOrderItemId
        })//Auth.execIfAuthValid
    }
}



//if orderItem with id match the product 
exports.matchProduct = (req, res) => {
    //validate user
    Auth.execIfAuthValid(req, res, null, (req, res, user) => {
        //user permitted
        OrderItems.userPermitted(req.params.id, user.id, user.role, (err, data) => {
            if (err) {
                return res.status(500).send({ message: err.message || "get permission failed" })
            } else {
                if (!(data.permitted)) {
                    return res.status(500).send({ message:  "not permitted" })
                } else {
                    OrderItems.matchById(req.params.id, (err, data) => {
                        if (err) {
                            return res.status(500).send({ message: err.message || "get permission failed" })
                        } else {
                            return res.status(200).send(data)
                        }
                    })//OrderItems.matchById
                }
            }
        })//OrderItems.userPermitted
        
    })//Auth.execIfAuthValid
    
}

//refresh orderItem with id from product
exports.refreshFromProduct= (req, res) => {
        //validate user
        Auth.execIfAuthValid(req, res, null, (req, res, user) => {
            Orders.findByOrderItemId(req.params.id, (err, data) => {
                if (err) {
                    return res.status(500).send({ message: err.message || "get order error" })
                } else {
                    if (data.length == 0) {
                        return res.status(500).send({ message:  "order not found" })
                    } else {
                        if (!(data[0].buyerId == user.id && data[0].status == "unSubmitted")) {
                            return res.status(500).send({ message:  "refresh not permitted" })
                        } else {
                            OrderItems.refreshFromProduct(req.params.id, (err, data) => {
                                if (err) {
                                    return res.status(500).send({ message: err.message || "refresh error" })
                                } else {
                                    return res.status(200).send(data)
                                }
                            })//OrderItems.refreshFromProduct
                        }
                    }
                }
            })//Orders.findByOrderItemId
            
        })//Auth.execIfAuthValid
}

