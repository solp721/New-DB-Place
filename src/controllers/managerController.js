const pool = require("../../middleware/db");

//관리자 페이지
exports.managerPage = async (req, res) => {
  try {
    const sup_info = await pool.query("select * from supply;");
    const sup = await pool.query(
      "SELECT * FROM supply INNER JOIN delivery ON supply.sup_num = delivery.supply_sup_num;"
    );

    const menu_recipe_info = await pool.query(
      "select * from coffeeshop.menu inner join recipe on menu_num = menu_menu_num inner join ingredient on recipe.ingredient_ingre_name = ingre_name;"
    );

    res.render("manager", {
      sup_info: sup_info[0],
      sup: sup[0],
      menu_recipe_info: menu_recipe_info[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("내부 서버 오류");
  }
};

//공급업체 추가
exports.addSupply = async (req, res) => {
  try {
    const { number, name, city } = req.body;
    if (!name || !city) {
      return res.redirect("/manager");
    }
    await pool.query(
      "INSERT INTO supply (sup_num, sup_name, sup_address) VALUES (?,?, ?)",
      [number, name, city]
    );
    return res.redirect("/manager");
  } catch (error) {
    console.error(error);
  }
};

//특별메뉴 수정
exports.uptype = async (req, res) => {
  try {
    const { menu_num, type } = req.body;
    const updatetype = await pool.query(
      "update menu set menu_best = ? where menu_num = ? ",
      [type, menu_num]
    );
    console.log(menu_num);
    if (type === "추천메뉴") {
      const ingre_menu = await pool.query(
        "select * from coffeeshop.menu inner join recipe on menu_num = menu_menu_num inner join ingredient on recipe.ingredient_ingre_name = ingre_name where menu_num = ?;",
        [menu_num]
      );
      for (let i = 0; i < ingre_menu.length; i++) {
        if (
          ingre_menu[0][i].ingre_totalcount <
          ingre_menu[0][i].recipe_req * 30
        ) {
          console.log(
            ingre_menu[0][i].ingredient_ingre_name,
            ingre_menu[0][i].ingre_totalcount,
            "적음"
          );
        }
      }
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const del_date = `${year}-${month}-${day}`;
      //추천메뉴되면 그 메뉴값 다 받아와서 그 메뉴에 필요한재료량 * 30개이상의 재고를
      // 자동으로 주문해서 남은재료량에 그 숫자를 더함
      // 만약이미 재고량이 그만큼있다면 아무것도안함
      // 공급업체는 마지막에 주문한 업체를 사용하고 주문목록단위는 Water을 제외 LBS로 통일
    }
    return res.redirect("/manager");
  } catch (error) {
    console.log(error);
  }
};

//재료구매
exports.addingre = async (req, res) => {
  try {
    const { sup_name, del_name, del_count, del_type } = req.body;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const del_date = `${year}-${month}-${day}`;

    const sup_info = await pool.query(
      "SELECT sup_num,sup_address from supply where sup_name = ?; ",
      [sup_name]
    );
    const ingre_info = await pool.query(
      "select ingre_totalcount from ingredient where ingre_name = ?",
      [del_name]
    );
    if (del_type === "KG") {
      del_totalprice = Number(del_count) * 1000;
    } else if (del_type === "L") {
      del_totalprice = Number(del_count) * 500;
    } else {
      del_totalprice = Number(del_count) * 250;
    }

    // console.log(
    //   sup_name,
    //   sup_info[0][0].sup_num,
    //   sup_info[0][0].sup_address,
    //   del_name,
    //   del_count,
    //   del_type,
    //   del_date,
    //   del_totalprice,
    //   ingre_info[0][0].ingre_totalcount
    // );
    const insert_delivery = await pool.query(
      "insert into delivery(supply_sup_num,ingredient_ingre_name,delivery_totalcount,delivery_date,delivery_ordertype,delivery_price)VALUES (?,?,?,?,?,?); ",
      [
        sup_info[0][0].sup_num,
        del_name,
        del_count,
        del_date,
        del_type,
        del_totalprice,
      ]
    );

    console.log(del_count, ingre_info[0][0].ingre_totalcount);
    const update_ingre = await pool.query(
      "update coffeeshop.ingredient set ingre_totalcount = ? where ingre_name = ?;",
      [Number(ingre_info[0][0].ingre_totalcount) + Number(del_count), del_name]
    );

    return res.redirect("/manager");
  } catch (error) {
    console.log(error);
  }
};

//메뉴추가
exports.addMenu = async (req, res) => {
  try {
    return res.redirect("/manager");
  } catch (error) {
    console.log();
  }
};
