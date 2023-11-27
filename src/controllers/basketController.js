const pool = require("../../middleware/db");

//장바구니 홈페이지
exports.basketPage = async (req, res) => {
  try {
    if (req.session.uid) {
      const user_info = await pool.query(
        "select user_id, user_name from user where user_id =?",
        [req.session.uid]
      );
      const basket_info = await pool.query(
        "select * from basket where user_user_id = ?",
        [req.session.uid]
      );
      if (basket_info[0].length != 0) {
        // 장바구니에 항목이 있는 경우
        const basket_list_info = await pool.query(
          "select * from basketlist where basket_basket_num = ?",
          [basket_info[0][0].basket_num]
        );
        const sumPrice = await pool.query(
          "select sum(menu_totalprice) as sum from basketlist where basket_basket_num = ?",
          [basket_info[0][0].basket_num]
        );
        const menuName = await pool.query(
          "select * from menu where menu_num in (select menu_menu_num from basketlist)"
        );
        res.render("basket", {
          signinStatus: true,
          userName: req.session.uid,
          user_info: user_info[0],
          basket_info: basket_info[0],
          basket_list_info: basket_list_info[0],
          sumPrice: sumPrice[0],
          menuName: menuName[0],
        });
      } else {
        res.render("basket", {
          signinStatus: true,
          user_info: user_info[0],
          basket_info: basket_info[0],
          basket_list_info: [],
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

//즉시구매
exports.buynow = async (req, res) => {
  try {
    const { menu_num } = req.params;
    const { menu_count, pay, menu_price } = req.body;

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const orderDate = `${year}-${month}-${day}`;
    const sumPrice = menu_count * menu_price;

    const addOrder = await pool.query(
      "INSERT INTO coffeeshop.order (order_date, order_pay, order_totalprice, user_user_id) VALUES (?, ?, ?, ?)",
      [orderDate, pay, sumPrice, req.session.uid]
    );

    const order = await pool.query(
      "SELECT * FROM coffeeshop.order WHERE user_user_id = ? ORDER BY order_num DESC LIMIT 1",
      [req.session.uid]
    );

    if (!order || !order[0] || !order[0][0]) {
      throw new Error("Order retrieval failed");
    }

    const addOrderMenu = await pool.query(
      "INSERT INTO coffeeshop.ordermenu(order_order_num, menu_menu_num, ordermenu_count, ordermenu_price) VALUES (?, ?, ?, ?)",
      [order[0][0].order_num, menu_num, menu_count, menu_price]
    );

    // 메뉴 주문이 완료되면 해당 메뉴의 recipe_req만큼의 재료를 빼기
    const ingreInfo = await pool.query(
      "SELECT recipe_req, ingre_name FROM recipe INNER JOIN ingredient ON ingredient_ingre_name = ingre_name WHERE menu_menu_num = ?",
      [menu_num]
    );

    await Promise.all(
      ingreInfo[0].map(async (ingredient) => {
        await pool.query(
          "UPDATE ingredient SET ingre_totalcount = ingre_totalcount - ? WHERE ingre_name = ?",
          [menu_count * ingredient.recipe_req, ingredient.ingre_name]
        );
      })
    );

    return res.redirect("/");
  } catch (error) {
    console.error(error);
  }
};

//장바구니에 메뉴 추가
exports.addMenu = async (req, res) => {
  const { menu_num } = req.params;
  const { menu_count } = req.body;

  try {
    const userId = req.session.uid;
    const basket = await pool.query(
      "select basket_num from basket where user_user_id=?",
      [userId]
    );

    const menu_info = await pool.query("select * from menu where menu_num=?", [
      menu_num,
    ]);

    const ingreInfo = await pool.query(
      "select recipe_req, ingre_name from recipe inner join ingredient on ingredient_ingre_name = ingre_name where menu_menu_num=?",
      [menu_num]
    );

    if (basket[0].length === 0) {
      const addBasket = await pool.query(
        "insert into basket (user_user_id) values(?)",
        [userId]
      );

      const newBasket = await pool.query(
        "select * from basket where user_user_id=?",
        [userId]
      );

      const menu_price = parseInt(menu_info[0][0].menu_price) * menu_count;

      const addMenu = await pool.query(
        "insert into basketlist(menu_menu_num, basket_basket_num, menu_count, menu_totalprice) values(?,?,?,?)",
        [menu_num, newBasket[0][0].basket_num, menu_count, menu_price]
      );

      const updateIngreCount = await Promise.all(
        ingreInfo[0].map(async (ingredient) => {
          await pool.query(
            "update ingredient set ingre_totalcount = ingre_totalcount - ? where ingre_name = ?",
            [menu_count * ingredient.recipe_req, ingredient.ingre_name]
          );
        })
      );
    } else {
      const menu = await pool.query(
        "select * from basketlist where menu_menu_num = ? and basket_basket_num = ?",
        [menu_num, basket[0][0].basket_num]
      );

      if (menu[0].length !== 0) {
        const count = parseInt(menu[0][0].menu_count) + parseInt(menu_count);
        const price =
          parseInt(menu[0][0].menu_totalprice) +
          parseInt(menu_info[0][0].menu_price) * parseInt(menu_count);

        const addMenuCount = await pool.query(
          "update basketlist set menu_count = ?, menu_totalprice = ? where menu_menu_num = ? and basket_basket_num = ?",
          [count, price, menu_num, basket[0][0].basket_num]
        );

        const updateIngreCount = await Promise.all(
          ingreInfo[0].map(async (ingredient) => {
            await pool.query(
              "update ingredient set ingre_totalcount = ingre_totalcount - ? where ingre_name = ?",
              [menu_count * ingredient.recipe_req, ingredient.ingre_name]
            );
          })
        );
      } else {
        const price =
          parseInt(menu_info[0][0].menu_price) * parseInt(menu_count);

        const insertMenu = await pool.query(
          "insert into basketlist (basket_basket_num, menu_menu_num, menu_count, menu_totalprice) values(?,?,?,?)",
          [basket[0][0].basket_num, menu_num, menu_count, price]
        );

        const updateIngreCount = await Promise.all(
          ingreInfo[0].map(async (ingredient) => {
            await pool.query(
              "update ingredient set ingre_totalcount = ingre_totalcount - ? where ingre_name = ?",
              [menu_count * ingredient.recipe_req, ingredient.ingre_name]
            );
          })
        );
      }
    }
    return res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

//장바구니에 메뉴 삭제
exports.deleteMenu = async (req, res) => {
  try {
    const { menu_num } = req.params;
    const userId = req.session.uid;

    const deletedMenu = await pool.query(
      "SELECT * FROM basketlist WHERE menu_menu_num = ? AND basket_basket_num IN (SELECT basket_num FROM basket WHERE user_user_id = ?)",
      [menu_num, userId]
    );

    const ingreInfo = await pool.query(
      "SELECT recipe_req, ingre_name FROM recipe INNER JOIN ingredient ON ingredient_ingre_name = ingre_name WHERE menu_menu_num = ?",
      [menu_num]
    );

    const cancelCount = deletedMenu[0][0].menu_count;

    const deleteMenu = await pool.query(
      "DELETE FROM basketlist WHERE menu_menu_num = ? AND basket_basket_num IN (SELECT basket_num FROM basket WHERE user_user_id = ?)",
      [menu_num, userId]
    );

    // 메뉴가 취소되면 해당 메뉴의 recipe_req만큼의 재료를 복원
    await Promise.all(
      ingreInfo[0].map(async (ingredient) => {
        await pool.query(
          "UPDATE ingredient SET ingre_totalcount = ingre_totalcount + ? WHERE ingre_name = ?",
          [cancelCount * ingredient.recipe_req, ingredient.ingre_name]
        );
      })
    );

    return res.redirect("/basket");
  } catch (error) {
    console.log(error);
  }
};

//장바구니 전체 삭제
exports.deleteBasket = async (req, res) => {
  try {
    const userId = req.session.uid;

    const deletedBasket = await pool.query(
      "SELECT * FROM basketlist WHERE basket_basket_num IN (SELECT basket_num FROM basket WHERE user_user_id = ?)",
      [userId]
    );

    let cancelCount = 0;
    deletedBasket[0].forEach((item) => {
      cancelCount += item.menu_count;
    });

    const deleteBasketlist = await pool.query(
      "DELETE FROM basketlist WHERE basket_basket_num IN (SELECT basket_num FROM basket WHERE user_user_id = ?)",
      [userId]
    );

    const deleteBasket = await pool.query(
      "DELETE FROM basket WHERE user_user_id = ?",
      [userId]
    );

    // 장바구니가 취소되면 해당 메뉴의 recipe_req만큼의 재료를 복원
    await Promise.all(
      deletedBasket[0].map(async (item) => {
        const ingreInfo = await pool.query(
          "SELECT recipe_req, ingre_name FROM recipe INNER JOIN ingredient ON ingredient_ingre_name = ingre_name WHERE menu_menu_num = ?",
          [item.menu_menu_num]
        );

        await Promise.all(
          ingreInfo[0].map(async (ingredient) => {
            await pool.query(
              "UPDATE ingredient SET ingre_totalcount = ingre_totalcount + ? WHERE ingre_name = ?",
              [item.menu_count * ingredient.recipe_req, ingredient.ingre_name]
            );
          })
        );
      })
    );

    return res.redirect("/basket");
  } catch (error) {
    console.log(error);
  }
};

//장바구니 주문
exports.orderBasket = async (req, res) => {
  temp = [];
  try {
    if (req.session.uid) {
      // 결제방식이랑 현재 날짜
      const { pay, menu_name, menu_count, menu_price, menu_num } = req.body;
      console.log("!!!", menu_num);

      if (menu_num.length >= 2) {
        for (var i = 0; i < menu_name.length; i++) {
          temp.push({
            menu_num: menu_num[i],
            menu_name: menu_name[i],
            menu_count: menu_count[i],
            menu_price: menu_price[i],
          });
          // console.log("안녕하세요", menu_num[i]);
        }
      } else {
        temp.push({
          menu_num: menu_num,
          menu_name: menu_name,
          menu_count: menu_count,
          menu_price: menu_price,
        });
      }
      console.log("!!!", temp);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const orderDate = `${year}-${month}-${day}`;

      try {
        // 현재 장바구니들고옴
        const basket_info = await pool.query(
          "select * from basket where user_user_id = ?",
          [req.session.uid]
        );
        // 현재 장바구니의 총액
        const sumPrice = await pool.query(
          "select sum(menu_totalprice) as sum from basketlist where basket_basket_num = ?",
          [basket_info[0][0].basket_num]
        );

        // 현재 장바구니에 담긴 메뉴들을 가져오기
        const basketItems = await pool.query(
          "SELECT * FROM basketlist WHERE basket_basket_num IN (SELECT basket_num FROM basket WHERE user_user_id=?)",
          [req.session.uid]
        );

        // order 테이블에 주문 추가
        const addOrder = await pool.query(
          "INSERT INTO coffeeshop.order (order_date, order_pay, order_totalprice, user_user_id) VALUES (?, ?, ?, ?)",
          [orderDate, pay, Number(sumPrice[0][0].sum), req.session.uid]
        );

        // 장바구니에서 구매하면 유저랭크 + 유저 주문총금액 업데이트
        try {
          if (req.session.uid) {
            const user_totalprice = await pool.query(
              "select user_totalprice from coffeeshop.user where user_id = ?",
              [req.session.uid]
            );

            const user_total = await pool.query(
              "update coffeeshop.user set user_totalprice = ? where user_id = ? ",
              [
                Number(user_totalprice[0][0].user_totalprice) +
                  Number(sumPrice[0][0].sum),
                req.session.uid,
              ]
            );

            if (user_totalprice[0][0].user_totalprice > 10000) {
              const insert_rank = await pool.query(
                "update coffeeshop.user set user_rank = ? where user_id = ?",
                ["Bronze", req.session.uid]
              );
            } else if (user_totalprice[0][0].user_totalprice > 30000) {
              const insert_rank2 = await pool.query(
                "update coffeeshop.user set user_rank = ? where user_id = ?",
                ["Silver", req.session.uid]
              );
            } else if (user_totalprice[0][0].user_totalprice > 50000) {
              const insert_rank3 = await pool.query(
                "update coffeeshop.user set user_rank = ? where user_id = ?",
                ["Gold", req.session.uid]
              );
            }
          }
        } catch (error) {
          console.log(error);
        }

        const ordermenu = await pool.query(
          "select * from coffeeshop.order where user_user_id = ? order by order_num desc;",
          [req.session.uid]
        );

        // ordermenu 테이블에 주문 내역 추가
        if (menu_name.length >= 2) {
          for (var i = 0; i < temp.length; i++) {
            const ordermenu_list = await pool.query(
              "INSERT INTO ordermenu VALUES (?, ?, ?, ?)",
              [
                ordermenu[0][0].order_num,
                temp[i].menu_num,
                temp[i].menu_count,
                temp[i].menu_price,
              ]
            );
          }
        } else {
          const ordermenu_list = await pool.query(
            "INSERT INTO ordermenu VALUES (?, ?, ?, ?)",
            [
              ordermenu[0][0].order_num,
              temp.menu_num,
              temp.menu_count,
              temp.menu_price,
            ]
          );
        }
      } catch (error) {
        console.log(error);
      }

      const deleteBasketlist = await pool.query(
        "delete from basketlist where basket_basket_num in (select basket_num from basket where user_user_id=?)",
        [req.session.uid]
      );

      return res.redirect("/basket");
    }
  } catch (error) {
    console.log(error);
  }
};
