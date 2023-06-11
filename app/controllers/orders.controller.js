"use strict";

const Orders = require("../models/orders.model");
const OrderItem = require("../models/orderItems.model");
const Products = require("../models/products.model");
const CartItem = require("../models/cartItems.model");
const db = require("../models/db");
const Auth = require("../utils/auth");
const { error } = require("npmlog");
/*
//add an order into orders table
exports.create = (req, res) => {

};
*/

//get all orders with username and/or sellername
exports.getAll = (req, res) => {
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    let sellerName;
    let buyerName;
    let statusFilter = false;
    switch (user.role) {
      case "seller": {
        sellerName = user.userName;
        statusFilter = true;
        break;
      }
      case "buyer": {
        buyerName = user.userName;
        break;
      }
      case "admin": {
        sellerName = req.body.sellerName;
        buyerName = req.body.buyerName;
        statusFilter = true;
        break;
      }
      default:
        res.status(500).send({ message: "Some error occurred while authenticating user." });
    }
    Orders.getAll(sellerName, buyerName, statusFilter, (err, data) => {
      if (err) {
        res.status(500).send({ message: err.message || "Some error occurred while retrieving orders." });
      } else {
        res.status(200).send(data);
      }
    });
  }); //Auth.execIfAuthValid end
};

//get one order with id
exports.getOne = (req, res) => {
  
}

//confirm an order, calculate price and fees
exports.confirmOrder = (req, res) => { }

//delete order
exports.delete = (req, res) => {
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    switch (user.role) {
      case "seller": {
        //seller not allowed to delete
        return;
      }
      case "buyer": {
        //buyer not allowed to delete other's order
        if (!(req.body.buyerId == user.id)) {
          return;
        }
        break;
      }
      case "admin": {
        break;
      }
      default:
        return;
    }

    Orders.remove(req.params.id, (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found order with id ${req.params.id}.`,
          });
        } else {
          res.status(500).send({
            message: "Could not delete order with id " + req.params.id,
          });
        }
      } else res.status(200).send({ message: true });
    }); //Orders.remove end
  }); //Auth.execIfAuthValid end
};

//pay an order
exports.payOrder= (req, res) => {

};


//patch order status
exports.modifyStatus = (req, res) => { }




exports.create = (req, res) => {

  let from;
  let sellerId;
  let sellerName;
  let orderId;
  let buyerId;
  let newOrder;
  let newOrderItem;

  if (req.body.productId) {
    from = "carts";
  } else {
    from = "products";
  };
    
  if (!(req.body.id && req.body.amount)) {
    return res.status(500).send({ message: "id and amount required" })
  } else {
    Products.getById((from == "carts") ? req.body.productId : req.body.id, (err, data) => {
      //get product record from products table
      if (err) {
        return res.status(500).send({ message: err.message || "errors when demanding products" });
      } else {
        if (!(data.id)) {
          res.status(500).send({ message: "Cannot find products!" });
          return;
        } else {
          sellerId = data.sellerId;
          //write product information into a new orderitem object
          newOrderItem = new OrderItem({
            productId: data.id,
            productCode: data.productCode,
            productName: data.productName,
            price: Number(data.price),
            amount: req.body.amount
          })
          Auth.execIfAuthValid(req, res, null, (req, res, user) => {
                    
            if (!(user.role == "buyer")) {
              return res.status(500).send({ message: "Only buyer can add order!" });
            } else {
              buyerId = user.id;
              if (from == "carts") {
                //if match the product table
                OrderItem.matchById(data.id, (err, data) => {
                  if (err) {
                    return res.status(500).send({ message: err.message || "matching failed" })
                  } else {
                    if (data.matched == false) {
                      return res.status(500).send({ message: err.message || "matching failed" })
                    } else {
                      //select existing unSubmitted order
                      db.query("select * from users where id= ? ", sellerId, (err, data) => {
                        if (err) {
                          return res.status(500).send({ message: err.message || "seller error" })
                        } else {
                          if (data.length == 0) {
                            return res.status(500).send({ message: "seller not found" })
                          } else {
                            sellerName = data[0].userName;
                            
                            Orders.getAll(sellerName, user.userName, false, (err, data) => {
                              if (err) {
                                return res.status(500).send({ message: err.message || "Create failed!" });
                              } else {
                                if (data.length == 0) {
                                  //create a new order
                                  newOrder = {
                                    sellerId: sellerId,
                                    buyerId: buyerId,
                                    deliveryInfo: `${user.userName}, ${user.address}`
                                  };
                                  Orders.create(newOrder, (err, data) => {
                                    if (err) {
                                      return res
                                        .status(500)
                                        .send({ message: err.message || "Create order failed!" });
                                    } else {
                                      orderId = data.id;
                                      newOrder = data;
                                      newOrderItem.orderId = newOrder.id;
                                      OrderItem.create(newOrderItem, (err, data) => {
                                        if (err) {
                                          return res.status(500).send({
                                            message:
                                              err.message || "Create order item failed!",
                                          })
                                        } else {
                                          if (from == "carts") {
                                            //delete cart item when transfered to order
                                            CartItem.remove(req.body.id, (err, data) => {
                                              if (err) {
                                                return res.status(500).send({ message: err.message || "delete from cart failed!" });
                                              } else {
                                                if (data.affectedRows == 0) {
                                                  return res.status(500).send({ message: "delete from cart failed!" });
                                                } else {
                                                  return res.status(200).send({ order: newOrder, orderItem: newOrderItem });
                                                }
                                    
                                              }
                                            });//CartItem.remove
                                          }
                                        }
                                      }); //OrderItem.create end
                                    }
                                  }); //Orders.create end
                                } else {
                                  //use the existing order record in orders table
                                  //orderId = data[0].id;
                                  newOrder = data[0];
                                  newOrderItem.orderId = newOrder.id;
                                  OrderItem.create(newOrderItem, (err, data) => {
                                    if (err) {
                                      return res.status(500).send({
                                        message: err.message || "Create order item failed!",
                                      });
                                    } else {
                                      if (from == "carts") {
                                        //delete cart item when transfered to order
                                        CartItem.remove(req.body.id, (err, data) => {
                                          if (err) {
                                            return res.status(500).send({
                                              message:
                                                err.message || "delete from cart failed!",
                                            });
                                          } else {
                                            //todo : successfully
                                            if (data.affectedRows == 0) {
                                              return res.status(500).send({ message: "remove cartItem failed" })
                                            } else {
                                              return res.status(200).send({ order: newOrder, orderItem: newOrderItem })
                                            }
                                          }
                                        })//CartItem.remove
                                      } else {
                                        return res.status(200).send({ order: newOrder, orderItem: newOrderItem })
                                      }
                                    }
                                  })//OrderItem.create
                                }
                              }
                            });//Orders.getAll end
                          }
                        }
                        
                      })//db.query seller end




                    }
                  }
                  
                })//OrderItem.matchById
              }//from product
              else {
                //from products 
                db.query("select * from users where id= ? ", sellerId, (err, data) => {
                  if (err) {
                    return res.status(500).send({ message: err.message || "seller error" })
                  } else {
                    if (data.length == 0) {
                      return res.status(500).send({ message: "seller not found" })
                    } else {
                      sellerName = data[0].userName;
                      Orders.getAll(sellerName, user.userName, false, (err, data) => {
                        if (err) {
                          return res.status(500).send({ message: err.message || "get order error!" });
                        } else {
                          //create a new order
                          if (data.length == 0) {
                            newOrder = {
                              sellerId: sellerId,
                              buyerId: buyerId,
                              deliveryInfo: `${user.userName}, ${user.address}`
                            };
                            Orders.create(newOrder, (err, data) => {
                              if (err) {
                                return res
                                  .status(500)
                                  .send({ message: err.message || "Create order failed!" });
                              } else {
                                newOrder = data;
                                newOrderItem.orderId = data.id;
                                OrderItem.create(newOrderItem, (err, data) => {
                                  if (err) {
                                    return res.status(500).send({
                                      message:
                                        err.message || "Create order item failed!",
                                    });
                                  } else {
                                    if (from == "carts") {
                                      //delete cart item when transfered to order
                                      CartItem.remove(req.body.id, (err, data) => {
                                        if (err) {
                                          return res.status(500).send({ message: err.message || "delete from cart failed!" });
                                        } else {
                                          if (data.affectedRows == 0) {
                                            return res.status(500).send({ message: "delete from cart failed!" });
                                          } else {
                                            return res.status(200).send({ order: newOrder, orderItem: newOrderItem });
                                          }
                                  
                                        }
                                      });//CartItem.remove
                                    }
                                    else {
                                      return res.status(200).send({ order: newOrder, orderItem: newOrderItem });
                                    }
                                  }
                                }); //OrderItem.create end
                              }
                            }); //Orders.create end
                          } else {
                            //use the existing order record in orders table
                            //orderId = data[0].id;
                            newOrder = data[0];
                            newOrderItem.orderId = newOrder.id;
                            OrderItem.create(newOrderItem, (err, data) => {
                              if (err) {
                                return res.status(500).send({
                                  message: err.message || "Create order item failed!",
                                })
                              } else {
                                console.log("created:", data)
                                if (from == "carts") {
                                  //delete cart item when transfered to order
                                  CartItem.remove(req.body.id, (err, data) => {
                                    if (err) {
                                      return res.status(500).send({
                                        message:
                                          err.message || "delete from cart failed!",
                                      });
                                    } else {
                                      if (data.affectedRows == 0) {
                                        return res.status(500).send({ message: "remove cartItem failed" })
                                      } else {
                                        return res.status(200).send({ order: newOrder, orderItem: newOrderItem })
                                      }
                                    }
                                  })//CartItem.remove
                                } else {
                                  return res.status(200).send({ order: newOrder, orderItem: newOrderItem });
                                }
                              }
                            })//OrderItem.create
                          }
                        }
                      });//Orders.getAll end
                    }
                  }
                })//db.query sellername end



                        
              }//add to order end
            }

          });//Auth.execIfAuthValid end
              
        }
      };
        
    });//Products.getById end
  }

    
}
                  

