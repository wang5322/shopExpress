module.exports = (app) => {
    const orders = require("../controllers/orders.controller");
    let router = require("express").Router();

    router.post("/", orders.create);
    app.use('/api/orders', router);
    app.use('/api/carts', router);
}