const express = require("express");
// const createProxyMiddleware = require("http-proxy-middeware");
const app = express();

const cookieParser = require("cookie-parser");

app.use(express.json());

app.use(cookieParser());

// app.use(

//   createProxyMiddleware('/',{
//     target: "http://localhost:6000",
//     changeOrigin: true,
//   })
// );

//importing middlewares
const errorMiddleware = require("./middlewares/errors");

//importing routes
const auth = require("./routes/auth");
const order = require("./routes/order");
const products = require("./routes/product");

app.use("/api/v1", products);
app.use("/api/v1", auth);
app.use("/api/v1", order);
app.use(errorMiddleware);

module.exports = app;
