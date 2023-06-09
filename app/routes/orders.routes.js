module.exports = (app) => {
    const orders = require("../controllers/orders.controller");
    let router = require("express").Router();

    router.post("/", orders.create);
    router.get("/", orders.getTest);
    app.use('/api/orders', router);
    app.use('/api/carts', router);
}