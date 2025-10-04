const express = require("express");
require("dotenv").config();
const app = express();
const port = 5000 || process.env.PORT;

app.get("/", (req, res) => {
  res.send("hello World!");
});
app.get("/twitter", (req, res) => {
  res.send("twitter");
});

app.get("/login", (req, res) => {
  res.send("<h1>please login at chai aur code</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
