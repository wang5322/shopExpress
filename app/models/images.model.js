const db = require("./db.js");

// constructor
const imagesClass = function (document) {
  this.title = document.title;
  this.data = document.data;
  // OPTION: you could also hava column 'filename' to remember the original file name
  this.mimeType = document.mimeType;
};

//create
imagesClass.create = (newDocument, result) => {
  db.query("INSERT INTO images SET ?", newDocument, (err, res) => {
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
imagesClass.findById = (id, result) => {
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
imagesClass.getAll = (sortOrder, result) => {
  var query = db.format("SELECT id, title, mimeType FROM images ORDER BY ??", [
    sortOrder,
  ]);
  // console.log(query);
  db.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

module.exports = imagesClass;
