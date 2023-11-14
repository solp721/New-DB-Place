var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var methodOverride = require("method-override");

var indexRouter = require("./src/routes/index");
var userRouter = require("./src/routes/userRoute");
var basketRouter = require("./src/routes/basketRoute");
var myPageRouter = require("./src/routes/myPageRoute");
var managerRouter = require("./src/routes/managerRoute");

var app = express();

//session 선언
var session = require("express-session");
var CoffeeShop = require("express-mysql-session")(session);

var options = {
  host: "localhost",
  user: "root",
  password: "00000",
  port: 3306,
  database: "coffeeshop",
};

var sessionStore = new CoffeeShop(options);

app.use(
  session({
    key: "key",
    secret: "secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(methodOverride("_method"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/basket", basketRouter);
app.use("/mypage", myPageRouter);
app.use("/manager", managerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
