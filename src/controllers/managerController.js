const pool = require("../../middleware/db");

exports.managerPage = async (req, res) => {
  res.render("manager");
};
