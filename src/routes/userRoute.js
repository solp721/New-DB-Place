var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");

//signin
router.get("/signin", userController.signin);
router.post("/signin", userController.login);

//signup
router.get("/signup", userController.signup);
router.post("/signup", userController.register);

module.exports = router;
