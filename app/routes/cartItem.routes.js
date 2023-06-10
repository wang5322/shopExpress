module.exports = (app) => {
    const cartItem = require("../controllers/cartItem.controller");
    let router = require("express").Router();

    router.get('/match', cartItem.matchProduct);
    
    app.use('/api/cartItem', router);
};