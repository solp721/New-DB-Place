var express = require("express");
var router = express.Router();

const managerController = require("../controllers/managerController");

//관리자 페이지
router.get("/", managerController.managerPage);

//공급업체 추가
router.post("/addSupply", managerController.addSupply);

router.post("/uptype", managerController.uptype);

module.exports = router;
