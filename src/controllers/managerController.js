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
    const ingre_info = await pool.query("select * from ingredient");

    res.render("manager", {
      sup_info: sup_info[0],
      sup: sup[0],
      menu_recipe_info: menu_recipe_info[0],
      ingre_info: ingre_info[0],
    });
  } catch (error) {
    console.error(error);
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
      console.log(ingre_menu[0][0].ingre_totalcount);
      for (let i = 0; i < ingre_menu.length; i++) {
        if (
          ingre_menu[0][i].ingre_totalcount <
          ingre_menu[0][i].recipe_req * 30
        ) {
          const update_ingre = await pool.query(
            "update coffeeshop.ingredient set ingre_totalcount = ? where ingre_name = ?;",
            [
              Number(ingre_menu[0][i].recipe_req * 30),
              ingre_menu[0][i].ingredient_ingre_name,
            ]
          );
        }
      }
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
    if (sup_info.length > 0) {
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
        [
          Number(ingre_info[0][0].ingre_totalcount) + Number(del_count),
          del_name,
        ]
      );
    }
    return res.redirect("/manager");
  } catch (error) {
    console.log(error);
  }
};

//메뉴추가
exports.addMenu = async (req, res) => {
  try {
    const { menu_num, menu_name, menu_price, menu_type, menu_spe } = req.body;
    console.log(menu_num, menu_name, menu_price, menu_type, menu_spe);
    const insert_menu = await pool.query(
      "insert into menu(menu_num,menu_name,menu_price,menu_type,menu_best)values(?,?,?,?,?)",
      [menu_num, menu_name, menu_price, menu_type, menu_spe]
    );
    return res.redirect("/manager");
  } catch (error) {
    console.log();
  }
};

//레시피추가
exports.addRecipe = async (req, res) => {
  try {
    const { menu_num, recipe_name, recipe_req } = req.body;
    console.log(menu_num, recipe_name, recipe_req);
    const insert_recipe = await pool.query(
      "insert into recipe(menu_menu_num,ingredient_ingre_name,recipe_req)values(?,?,?)",
      [menu_num, recipe_name, recipe_req]
    );
    return res.redirect("/manager");
  } catch (error) {
    console.log();
  }
};

//재료추가
exports.insertIngre = async (req, res) => {
  try {
    const { ingre_name, ingre_from } = req.body;

    console.log(ingre_name, ingre_from);
    const insertingre = await pool.query(
      "INSERT INTO ingredient (ingre_name,ingre_totalcount, ingre_from) VALUES (?,0, ?)",
      [ingre_name, ingre_from]
    );
    return res.redirect("/manager");
  } catch (error) {
    console.error(error);
  }
};
