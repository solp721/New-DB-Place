var express = require("express");
var router = express.Router();

const pool = require("../../middleware/db");

/* GET home page. */
router.get("/", async (req, res) => {
  // 메뉴 보여줌
  const menu = await pool.query("SELECT * FROM menu");
  // 세션상태에 따라 상세정보도 보여줌
  const ingre = await pool.query(
    "select * from menu inner join recipe on menu_num = menu_menu_num inner join ingredient on ingredient_ingre_name = ingre_name;"
  );

  console.log(ingre);
  if (req.session.uid) {
    const user_info = await pool.query(
      "select user_id,user_name from user where user_id = ?",
      [req.session.uid]
    );
    res.render("index", {
      user_info: user_info[0][0],
      userName: req.session.uid,
      signinStatus: true,
      menu_info: menu[0],
      ingre_info: ingre[0],
    });
  } else {
    res.render("index", {
      menu_info: menu[0],
      signinStatus: false,
    });
  }
});

router.post("/search", async (req, res) => {
  let { query } = req.body;

  console.log(query);

  if (query == "커피") {
    query = "coffee";
  } else if (query == "디저트") {
    query = "dessert";
  }

  try {
    if (req.session.uid) {
      const menuSearch = await pool.query(
        "SELECT * FROM coffeeshop.menu where menu_name like ? or menu_type like ? ;",
        ["%" + query + "%", "%" + query + "%"]
      );
      const ingre = await pool.query(
        "select menu_num,menu_name,ingre_name,ingre_from,ingre_totalcount from menu inner join recipe on menu_num = menu_menu_num inner join ingredient on ingredient_ingre_name = ingre_name;"
      );
      const user_info = await pool.query(
        "select user_id,user_name from user where user_id = ?",
        [req.session.uid]
      );
      const user_basket_info = await pool.query(
        "select basket_num from basket where user_user_id",
        [req.session.uid]
      );

      res.render("index", {
        user_info: user_info[0][0],
        userName: req.session.uid,
        signinStatus: true,
        menu_info: menuSearch[0],
        ingre_info: ingre[0],
        basketAmount: user_basket_info[0].length,
      });
    } else {
      res.send(
        "<script>alert('검색결과가 존재하지 않습니다.'); window.location.href = '/';</script>"
      );
    }
  } catch (error) {
    console.log(error);
  }
}); // 검색 기능

module.exports = router;
