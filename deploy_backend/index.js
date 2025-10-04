const express = require("express");
const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("hello World!");
});
app.get('/twitter',(req,res)=>{
    res.send("twitter")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
