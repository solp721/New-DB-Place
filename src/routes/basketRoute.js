var express = require("express");
var router = express.Router();

const basketController = require("../controllers/basketController");

//장바구니 페이지
router.get("/", basketController.basketPage);

//장바구니 추가
router.post("/addMenu/:menu_num", basketController.addMenu);

//장바구니 메뉴 삭제
router.delete("/deleteMenu/:menu_num", basketController.deleteMenu);

//장바구니 삭제
router.post("/deleteBasket", basketController.deleteBasket);

//장바구니 구매
router.post("/orderBasket", basketController.orderBasket);

//바로구매
router.post("/buynow/:menu_num", basketController.buynow);

module.exports = router;
