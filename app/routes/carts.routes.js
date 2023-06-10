module.exports = (app) => {
    const carts = require("../controllers/carts.controller");
    let router = require("express").Router();

    router.post("/", carts.create);
    router.get("/", carts.getAll);
    router.delete("/:id([0-9]+)", carts.delete);
    
    app.use('/api/carts', router);

}