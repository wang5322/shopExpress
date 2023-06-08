"use strict";

const Orders = require("../models/orders.model");

exports.create = (req, res) => {
    
    if (req.baseUrl == "/api/orders") {
        res.status(200).send("orders");
    } else if (req.baseUrl == "/api/carts") {
        res.status(202).send("carts");
    };
    
    
}