module.exports = (app) => {
    const users = require("../controllers/users.controllers");

    let router = require("express").Router();

    //Create new user
    router.post("/", users.create);

    //Retrive a user by username
    router.get("/:username", users.findOne);

    //Update a user by userId
    router.put("/:id([0-9]+)", users.update);

    //Delete user by userID
    router.delete("/:id([0-9]+)", users.delete);

    app.use("/api/users", router);
}