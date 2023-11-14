const pool = require("../../middleware/db");

exports.signin = async (req, res) => {
  try {
    if (req.session.uid) {
      delete req.session.uid;
      req.session.save(function () {
        res.redirect("/");
      });
    } else {
      res.render("signin");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res) => {
  try {
    const { uid, uphone } = req.body;
    console.log("!!!", uid, uphone);
    let user = await pool.query("select * from user where user_id = ?", [uid]);
    if (user[0].length !== 0) {
      let user_id = user[0][0].user_id;
      let user_phonenum = user[0][0].user_phone;

      if (uid === user_id && uphone === user_phonenum) {
        req.session.uid = uid;
        req.session.save();
        return res.redirect("/");
      } else {
        return res.redirect("/user/sginin");
      }
    } else {
      return res.redirect("/user/signin");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.signup = async (req, res) => {
  try {
    res.render("signup", {
      signinStatus: false,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.register = async (req, res) => {
  try {
    const { uid, uname, uaddress, uphone } = req.body;
    console.log(uid, uname, uaddress, uphone, "<- 이걸로 회원가입 완료");
    const user_info = await pool.query(
      "insert into user(user_id,user_name,user_address,user_phone) values(?,?,?,?)",
      [uid, uname, uaddress, uphone]
    );
    return res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};
