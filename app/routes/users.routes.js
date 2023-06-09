module.exports = (app) => {
    const users = require("../controllers/users.controllers");

    let router = require("express").Router();

    //Create new user
    router.post("/", users.create);

    // login
    router.post("/login", users.login);

    //Retrive a user by username
    router.get("/:username", users.findOne);

    //Update a user by username
    router.put("/:username", users.update);

    //Delete user by name
    router.delete("/:username", users.delete);

    app.use("/api/users", router);
}