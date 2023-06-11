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

Products.getAll = (
  category,
  searchFor,
  available,
  sellerId,
  userName,
  result
) => {
  console.log(category, searchFor, available, sellerId, userName);

  let sql =
    "SELECT products.*, images.id AS image_id FROM products JOIN users ON (products.sellerId = users.id AND users.role='seller') LEFT JOIN images ON products.id = images.productId";
  let inserts = [];
  let filterStr = "";

  if (available !== "both") {
    filterStr = " WHERE available = ?";
    inserts.push(available === "false" ? 0 : 1);
  }

  if (category) {
    if (filterStr.length == 0) {
      filterStr = " WHERE category = ?";
    } else {
      filterStr += " AND category = ?";
    }
    inserts.push(category);
  }

  if (searchFor) {
    if (filterStr.length == 0) {
      filterStr =
        " WHERE (productCode like ? or productName like ? or productDesc like ?)";
    } else {
      filterStr +=
        " AND (productCode like ? or productName like ? or productDesc like ?)";
    }
    let searchPattern = "%" + searchFor + "%";
    inserts.push(searchPattern, searchPattern, searchPattern);
  }

  if (sellerId) {
    if (filterStr.length == 0) {
      filterStr = " WHERE sellerId = ?";
    } else {
      filterStr += " AND sellerId = ?";
    }
    inserts.push(sellerId);
  }

  if (userName) {
    if (filterStr.length == 0) {
      filterStr = " WHERE users.userName = ?";
    } else {
      filterStr += " AND users.userName = ?";
    }
    inserts.push(userName);
  }

  sql += filterStr;
  let query = db.format(sql, inserts);
  console.log(query);

  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Products.getById = (id, result) => {
  let queryStr = `SELECT products.*, images.id AS image_id FROM products LEFT JOIN images ON (products.id = images.productId) WHERE products.id = ? `;
  db.query(queryStr, id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.length) {
      console.log("found products: ", res[0]);
      result(null, res[0]);
      return;
    }
    result({ kind: "not_found" }, null);
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

Products.updateStockById = (id, stockNum, available, result) => {
  const queryStr = `UPDATE products SET stockNum = ?, available = ? WHERE id = ?`;
  db.query(queryStr, [stockNum, available, id], (err, res) => {
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
