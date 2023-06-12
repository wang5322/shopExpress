module.exports = (app) => {
    const orderItem = require("../controllers/orderItem.controller");
    let router = require("express").Router();
    
    router.post("/", orderItem.addToOrder);
    router.delete('/:id([0-9]+)', orderItem.delete);
    router.get('/order/:id([0-9]+)', orderItem.getAllByOrderId);
    router.get('/:id([0-9]+)', orderItem.getOne);
    router.patch('/:id([0-9]+)', orderItem.modifyAmount);
    
    router.get('/match/:id([0-9]+)', orderItem.matchProduct);
    router.put('/refresh/:id([0-9]+)', orderItem.refreshFromProduct);
    

    app.use('/api/orderItem', router);
};