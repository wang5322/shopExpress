module.exports = (app) => {
    const cartItem = require("../controllers/cartItem.controller");
    let router = require("express").Router();

    router.get('/', cartItem.getAll);
    router.put('/match', cartItem.matchProduct);
    router.put('/refresh', cartItem.refreshFromProduct);
    router.put('/', cartItem.updata);
    router.delete('/', cartItem.delete);

    app.use('/api/cartItem', router);
};