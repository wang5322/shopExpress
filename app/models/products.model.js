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
    result(null, { id: res.insertId, ...newProduct });
  });
};

Products.getAll = (category, searchFor, available, result) => {
    
    console.log(category,searchFor,available);

    let queryStr = "select * from products";
    let filterStr = "";
    switch (available) {
        case "both": break;
        case "false": {
            filterStr += "available=0";
            break;
        }
        default:
            filterStr += "available=1";
    }

    if (category) {
        if (filterStr.length > 0) { filterStr += " and " };
        filterStr += `category='${category}'`;
    };
    if (searchFor) {
        if (filterStr.length > 0) { filterStr += " and " };
        filterStr += `(productCode like '%${searchFor}%' or productName like '%${searchFor}%' or productDesc like '%${searchFor}%')`;
    }
    filterStr += `(productCode like '%${searchFor}%' or productName like '%${searchFor}%' or productDesc like '%${searchFor}%')`;

  if (filterStr.length > 0) {
    queryStr += ` where ${filterStr}`;
  }

    //console.log(filterStr);
    db.query(queryStr, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        result(null, res);
    });
};

Products.getOne = (id, result) => {
  let queryStr = `select * from products where id = ${id}`;
  db.query(queryStr, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

module.exports = Products;
