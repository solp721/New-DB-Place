const pool = require("../../middleware/db");

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

exports.uptype = async (req, res) => {
  try {
    const { menu_num, type } = req.body;

    const updatetype = await pool.query(
      "update menu set menu_best = ? where menu_num = ? ",
      [type, menu_num]
    );

    return res.redirect("/manager");
  } catch (error) {
    console.log(error);
  }
};

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
