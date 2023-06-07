"use strict";

const db = require("./db");
const Products = function (product) {
    this.category = product.category;
    this.sellerId = product.sellerId;
    this.productCode = product.productCode;
    this.productName = product.productName;
    this.productDesc = product.productDesc;
    this.price = product.price;
    this.stockNum = product.stockNum;
    this.imageUrl = product.imageUrl;
    this.available = product.available;
};
Products.create = (newProduct, result) => {
    db.query("INSERT INTO products SET ?", newProduct, (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            console.log("created products: ", { id: res.insertId, ...newProduct });
            result(null, { id: res.insertId, ...newToDos });
        });
};

Products.getAll = (category, searchFor, result) => {
    console.log("category");
    let queryStr = "select * from products";
    let filterStr = "";
    if (category.length > 0) {
        filterStr += `category='${category}'`;
    };
    if (searchFor.length > 0) {
        if (filterStr.length > 0) { filterStr += " and " };
        filterStr += `(productCode like '%${searchFor}%' or productName like '%${searchFor}%' or productDesc like '%${searchFor}%'`;
    }
    if (filterStr.length > 0) { queryStr += ` where ${filterStr}` };

    db.query(queryStr, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        result(null, res);
    })
};

    




