module.exports = (app) => {
    const cartItem = require("../controllers/cartItem.controller");
    let router = require("express").Router();

    router.get('/:id([0-9]+)', cartItem.getAll);
    router.put('/match/:id([0-9]+)', cartItem.matchProduct);
    router.put('/refresh/:id([0-9]+)', cartItem.refreshFromProduct);
    router.put('/', cartItem.updata);
    router.delete('/', cartItem.delete);

    app.use('/api/cartItem', router);
};