"use strict";

const Orders = require("../models/orders.model");

exports.create = (req, res) => {
    if (isValid(req, res) === false) {
        res.status(500).send({ message: "unvalid request!" });
        return;
    }
    
    if (req.baseUrl == "/api/orders") {
        res.status(200).send("orders");
    } else if (req.baseUrl == "/api/carts") {
        res.status(202).send("carts");
    };
    
    
}

//validator for requests
function isValid(req, res) {
    return true;
}