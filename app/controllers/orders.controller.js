"use strict";

const Orders = require("../models/orders.model");
const OrderItem = require("../models/orderItems.model");
const Products = require("../models/products.model");
const CartItem = require("../models/cartItems.model");
const db = require("../models/db");
const Auth = require("../utils/auth");
const { error } = require("npmlog");

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
    console.log(sellerName, buyerName, statusFilter);
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
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    Orders.userPermitted(req.params.id, user.id, user.role, (err, data) => {
      if (err) {
        return res.status(500).send({message: err.message|| "get permission error"})
      } else {
        if (data.permitted == false) {
          return res.status(500).send({message:  "not permitted"})
        } else {
          Orders.findById(req.params.id, (err, data) => {
            if (err) {
              return res.status(500).send({ message: err.message || "" })
            } else {
              return res.status(200).send(data)
            }
          })//Orders.findById end
        }
      }
    })//Orders.userPermitted

  })//Auth.execIfAuthValid
}

//confirm an order, calculate price and fees
exports.buyerConfirm = (req, res) => { 
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    if (!(user.role == "buyer")) {
      return res.status(500).send({message:"only buyer can confirm"})
    } else {
      Orders.findById(req.params.id, (err, data) => {
        if (err) {
          return res.status(500).send({message:err.message||"get order error"})
        } else {
          if (data.length == 0) {
            return res.status(500).send({message:"no order found"})
          } else {
            if (!(data[0].buyerId == user.id && data[0].status=="unSubmitted")) {
              return res.status(500).send({message:"not permitted"})
            } else {
              let order = new Orders(data[0]);
              order.status = "BuyerConfirmed";
              order.orderTime = new Date().toLocaleDateString();
              if (req.body.deliveryInfo) {
                order.deliveryInfo = req.body.deliveryInfo
              };
              OrderItem.getByOrderId(req.params.id, (err, data) => {
                if (err) {
                  return res.status(500).send({message:err.message||"get order item error"})
                } else {
                  if (data.length == 0) {
                    return res.status(500).send({message:"no order items found"})
                  } else {
                    let totalPrice = 0;
                    for (let i = 0; i < data.length; i++){
                      totalPrice = Number(totalPrice) + Number(data[i].price * data[i].amount);
                    }
                    order.totalPrice = totalPrice;
                    order.taxes = totalPrice * 0.15;
                    order.shippingFee = (totalPrice * 0.1 < 5) ? 5 : (totalPrice * 0.1);
                    order.finalTotalPay = Number(order.totalPrice) + Number(order.taxes) + Number(order.shippingFee);
                    //update order
                    Orders.updateById(req.params.id, order, (err, data) => {
                      if (err) {
                        return res.status(500).send({message:err.message||"update error"})
                      } else {
                        return res.status(200).send(data);
                      }
                    })//Orders.updateById
                  }
                }
              })//OrderItem.getByOrderId
            }
          }
        }
      })//Orders.findById
    }

  })//Auth.execIfAuthValid
}

//delete order -- to be fixed
exports.delete = (req, res) => {
  Auth.execIfAuthValid(req, res, null, (req, res, user) => {
    switch (user.role) {
      case "seller": {
        //seller not allowed to delete
        return res.status(500).send({message: "delete not permitted"})
      }
      case "buyer": {
        //validate if permitted
        Orders.findById(req.params.id, (err, data) => {
            if (err) {
              return res.status(500).send({message:err.message|| "delete not permitted"})
            } else {
              if (data.length == 0) {
                return res.status(500).send({message: "order not found"})
              } else {
                if (!(data[0].buyerId==user.id &&(data[0].status == "unSubmitted" || data[0].status == "buyerConfirmed"))) {
                  
                }
              }
            }
          })
        
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



//add cartitem or product with amount to exist order if permitted, or create a new order
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
                  

