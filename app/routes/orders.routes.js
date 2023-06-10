module.exports = (app) => {
    const orders = require("../controllers/orders.controller");
    let router = require("express").Router();

    router.post("/", orders.create);
    router.get("/", orders.getOrders);
    app.use('/api/orders', router);

}