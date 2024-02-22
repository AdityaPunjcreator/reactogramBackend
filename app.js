const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors()); // this middleware will enable the server side to allow the client request which is coming
const authrouter = require("./Router/auth_router");
const postrouter = require("./Router/postRouter");
const fileuploadrouter = require("./Router/file_router");
// app.use method is a method in express to mount the middleware functions
app.use(express.json());

app.use("/api/v1/reactogram/user", authrouter);
app.use("/api/v1/reactogram", postrouter);

app.use("/api/v1/reactogram", fileuploadrouter);
// // Serve static files from the "Uploads" directory
// app.use("/static", express.static("Uploads"));

module.exports = app;
