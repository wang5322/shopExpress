const db = require("./db.js");

// constructor
const ImageClass = function (image) {
  this.title = image.title;
  this.data = image.data;
  // OPTION: you could also hava column 'filename' to remember the original file name
  this.mimeType = image.mimeType;
  this.productId = image.productId;
};

//create
ImageClass.create = (newImage, result) => {
  db.query("INSERT INTO images SET ?", newImage, (err, res) => {
    //TODO: check if productId exists

    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created document: ", { id: res.insertId /*, ...newToDos */ }); // do not attempt to print a blob on the console! it's much too big.
    result(null, { id: res.insertId }); // Only return the Id, sending back the entire blob is completely unnecessary and terrible for performance
  });
};

//return one by id
ImageClass.findById = (id, result) => {
  // FIXME: prevent SQL injection
  db.query("SELECT * FROM images WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found document: ", res[0]["id"]); // only display the Id, perhaps other values, but NEVER the blob
      result(null, res[0]);
      return;
    }
    // not found
    result({ kind: "not_found" }, null);
  });
};

// return all todo[serach by task and return all if any]
// WARNING: when a table has BLOBs do *NOT* fetch blobs when fetching multiple records! Only all other fields
ImageClass.getAll = (productId, sortOrder, result) => {
  let sql = "SELECT id, title, mimeType, productId FROM images";
  let inserts = [];
  let filterStr = "";

  if (productId) {
    filterStr = " WHERE productId = ?";
    inserts.push(productId);
  }

  if (sortOrder) {
    filterStr += " ORDER BY ?";
    inserts.push(sortOrder);
  }
  sql += filterStr;
  var query = db.format(sql, inserts);
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

ImageClass.removeByProductId = (productId, result) => {
  let queryStr = `DELETE FROM images WHERE productId=?`;
  db.query(queryStr, productId, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      console.log("No image found for product id: ", productId);
    } else {
      console.log("Deleted image(s) for product id: ", productId);
    }

    result(null, res);
  });
};

module.exports = ImageClass;
