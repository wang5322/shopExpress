module.exports = (app) => {
  const orders = require("../controllers/orders.controller");
  let router = require("express").Router();

 router.post("/", orders.create);
    
    //api/orders/abuyername/buyfrom/asellername
    //api/orders/abuyername
    //api/orders/buyfrom/asellername
  router.get("/:buyerName?/buyfrom/:sellerName?", orders.getAll);
  router.get("/:id([0-9]+)", orders.getOne);
  router.put("/:id([0-9]+)", orders.buyerConfirm);
  router.delete("/:id([0-9]+)", orders.delete);

  router.patch("/pay/:id([0-9]+)", orders.payOrder);

  router.patch("/:id([0-9]+)", orders.modifyStatus);

  app.use("/api/orders", router);
};
