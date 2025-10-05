import express from "express";

const app = express();
const port = 3000;

app.use(express.static("dist"));

app.get("/api/jokes", (req, res) => {
  res.send([
    "Why don't scientists trust atoms? Because they make up everything!",
    "What do you call a fish with no eyes? Fsh!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "How does a penguin build its house? Igloos it together!",
    "What do you call a boomerang that won't come back? A stick!",
  ]);
});

app.listen(port, () => {
  console.log(`server run at port:${port}`);
});
