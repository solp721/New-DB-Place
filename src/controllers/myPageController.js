const pool = require("../../middleware/db");

exports.mypage = async (req, res) => {
  try {
    if (req.session.uid) {
      const user_info = await pool.query(
        "select * from coffeeshop.user where user_id=?",
        [req.session.uid]
      );
      const order_info = await pool.query(
        "select * from coffeeshop.order where user_user_id =?",
        [req.session.uid]
      );
      if (order_info[0].length != 0) {
        const order_list_info = await pool.query(
          "select * from coffeeshop.ordermenu where order_order_num = ?",
          [order_info[0][0].order_num]
        );
        const menu_info = await pool.query(
          "SELECT * FROM coffeeshop.order o JOIN coffeeshop.ordermenu om ON o.order_num = om.order_order_num JOIN coffeeshop.menu m ON om.menu_menu_num = m.menu_num where user_user_id = ?",
          [req.session.uid]
        );

        res.render("mypage", {
          user_info: user_info[0],
          order_info: order_info[0],
          order_list_info: order_list_info[0],
          menu_info: menu_info[0],
          signinStatus: true,
        });
      } else {
        res.render("mypage", {
          user_info: user_info[0],
          order_info: order_info[0],
          signinStatus: true,
        });
      }
    } else {
      res.redirect("signin");
    }
  } catch (error) {
    console.log(error);
  }
};
