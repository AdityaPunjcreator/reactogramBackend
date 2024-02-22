const env = require("dotenv");
env.config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app"); ///////////////////////////////////////////////////;

// connect method returns a promise which we are consuming with the use of then
// here we are establishing a connection with mongodb database

// "process" is the object on which we are accessing the "env" object on that we have the property "CONN_STR"
mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log("DB connection established");
  })
  .catch((err) => console.error(err));

const port = process.env.PORT || 3000;
//creating and starting the server
app.listen(port, () => {
  console.log("server is listening on port", port);
});
