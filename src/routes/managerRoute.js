var express = require("express");
var router = express.Router();

const managerController = require("../controllers/managerController");

//관리자 페이지
router.get("/", managerController.managerPage);

//공급업체 추가
router.post("/addSupply", managerController.addSupply);

//공급업체 재료 주문
router.post("/addingre", managerController.addingre);

//메뉴타입 업데이트
router.post("/uptype", managerController.uptype);

//메뉴추가
router.post("/addMenu", managerController.addMenu);

module.exports = router;
