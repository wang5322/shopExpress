"use strict";

const Orders = require("../models/orders.model");
const OrderItem = require("../models/orderItems.model");
const Products = require("../models/products.model");
const CartItem = require("../models/cartItems.model");
const Auth = require("../utils/auth");
const { error } = require("npmlog");

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
                break;
            }
            default: return;
        }
        Orders.getAll(sellerName, buyerName, statusFilter, (err, data) => {
            if (err) {
                res.status(500).send({ message: err.message || "Some error occurred while retrieving orders." });
            } else {
                res.status(200).send(data);
            }
        })
    });//Auth.execIfAuthValid end
};



exports.create = (req, res) => {

    let from;
    let cartIdForDel;
    let sellerId;
    let buyerId;
    if (req.body.productId) {
        from = "carts"; 
        cartIdForDel= req.body.cartId;
    } else {
        from = "products";
    };
    
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
                Auth.execIfAuthValid(req, res, null, (req, res, user) => {
                    
                    if (!(user.role == "buyer")) {
                        return res.status(500).send({ message: `Only buyer can add order!` });
                    } else {
                        buyerId = user.id;
                        let newOrder;
                        //write product information into a new orderitem object
                        let newOrderItem = new OrderItem({
                            productId: data[0].id,
                            productCode: data[0].productCode,
                            productName: data[0].productName,
                            price: Number(data[0].price),
                            amount: req.body.amount
                
                        });

              if (from == "carts") {
                if (
                  !(
                    req.body.productCode == data[0].productCode &&
                    req.body.productName == data[0].productName &&
                    req.body.price == data[0].price
                  )
                ) {
                  return res.status(500).send({
                    message:
                      "Cart items does not match the product information!",
                  });
                }
              }

              //select existing unSubmitted order
              Orders.getAll(sellerId, buyerId, "unSubmitted", (err, data) => {
                if (err) {
                  res
                    .status(500)
                    .send({ message: err.message || "Create failed!" });
                  return;
                } else {
                  if (data.length == 0) {
                    //create a new record to orders table
                    newOrder = {
                      sellerId: sellerId,
                      buyerId: buyerId,
                    };
                    Orders.create(newOrder, (err, data) => {
                      if (err) {
                        return res
                          .status(500)
                          .send({ message: err.message || "Create failed!" });
                      } else {
                        orderId = data.id;
                        newOrder = data;
                        newOrderItem.orderId = newOrder.id;
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
                                  return res.status(500).send({
                                    message:
                                      err.message || "delete from cart failed!",
                                  });
                                }
                              });
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
        };

        Orders.remove(req.params.id, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found order with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Could not delete order with id " + req.params.id
                    });
                }
            } else res.status(200).send({ message: true });
        });//Orders.remove end

    })//Auth.execIfAuthValid end
};