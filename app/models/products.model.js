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

Products.getAll = (category, searchFor, available, sellerId, result) => {
  console.log(category, searchFor, available, sellerId);

  let queryStr = "select * from products";
  let filterStr = "";
  switch (available) {
    case "both":
      break;
    case "false": {
      filterStr += "available=0";
      break;
    }
    default:
      filterStr += "available=1";
  }

  if (category) {
    if (filterStr.length > 0) {
      filterStr += " and ";
    }
    filterStr += `category='${category}'`;
  }
  if (searchFor) {
    if (filterStr.length > 0) {
      filterStr += " and ";
    }
    filterStr += `(productCode like '%${searchFor}%' or productName like '%${searchFor}%' or productDesc like '%${searchFor}%')`;
  }

  if (sellerId) {
    if (filterStr.length > 0) {
      filterStr += " and ";
    }
    filterStr += `sellerId = '${sellerId}'`;
  }

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

// Products.getBySeller = (available, sellerId, sortOrder, result) => {
//   console.log(sellerId, sortOrder, available);

//   let queryStr = "SELECT * FROM products";
//   let filterStr = "";
//   switch (available) {
//     case "both":
//       break;
//     case "false": {
//       filterStr += "available=0";
//       break;
//     }
//     default:
//       filterStr += "available=1";
//   }
//   if (sellerId) {
//     if (filterStr.length > 0) {
//       filterStr += " and ";
//     }
//     filterStr += `sellerId='${sellerId}'`;
//   }
//   if (filterStr.length > 0) {
//     queryStr += ` WHERE ${filterStr}`;
//   }
//   queryStr += `ORDER BY ${sortOrder}`;

//   db.query(queryStr, (err, res) => {
//     if (err) {
//       console.log("error", err);
//       result(null, err);
//       return;
//     }
//     result(null, res);
//   });
// };

Products.getById = (id, result) => {
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

Products.updateById = (id, products, result) => {
  let queryStr = `UPDATE products SET category =?,sellerId =?,productCode=?,productName=?,productDesc =?, price = ?, stockNum = ?, imageUrl=?, available=? WHERE id =?`;
  db.query(
    queryStr,
    [
      products.category,
      products.sellerId,
      products.productCode,
      products.productName,
      products.productDesc,
      products.price,
      products.stockNum,
      products.imageUrl,
      products.available,
      id,
    ],
    (err, res) => {
      //TODO: validate enums
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Todos with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated products: ", { id: id, ...products });
      result(null, { id: id, ...products });
    }
  );
};

Products.updateStockById = (id, stockNum, result) => {
  const queryStr = `UPDATE products SET stockNum = ? WHERE id = ?`;
  db.query(queryStr, [stockNum, id], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.affectedRows == 0) {
      // not found Todos with the product
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("updated product with id: ", id);
    result(null, res);
  });
};

Products.removeById = (id, result) => {
  let queryStr = `DELETE FROM products WHERE id=?`;
  db.query(queryStr, id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Todos with the product
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted product with id: ", id);
    result(null, res);
  });
};

Products.removeAll = (result) => {
  sql.query("DELETE FROM products", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} products`);
    result(null, res);
  });
};

module.exports = Products;
