var express = require("express");
var router = express.Router();

const managerController = require("../controllers/managerController");

//장바구니 페이지
router.get("/", managerController.managerPage);

module.exports = router;
