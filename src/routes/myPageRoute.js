var express = require("express");
var router = express.Router();

const myPageController = require("../controllers/myPageController");

router.get("/", myPageController.mypage);

module.exports = router;
