// managerController.js

const pool = require("../../middleware/db");

exports.managerPage = async (req, res) => {
  try {
    const sup_info = await pool.query("select * from supply;");
    const sup = await pool.query(
      "SELECT * FROM supply INNER JOIN delivery ON supply.sup_num = delivery.supply_sup_num;"
    );
    const menu_recipe_info = await pool.query(
      "SELECT * FROM coffeeshop.menu inner join coffeeshop.recipe on menu_num = recipe.menu_menu_num;"
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
      return res.status(400).json({ error: "이름과 도시를 모두 입력하세요." });
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
