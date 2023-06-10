module.exports = (app) => {
    const orders = require("../controllers/orders.controller");
    let router = require("express").Router();

    router.post("/", orders.create);
    router.get("/", orders.getAll);
    router.delete("/:id([0-9]+)", orders.delete);
    
    app.use('/api/orders', router);

}