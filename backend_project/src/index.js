import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import { app } from "./app.js";
dotenv.config();
const PORT = process.env.PORT;
connectDB()
  .then(() => {
    app.listen(PORT || 3000, () =>
      console.log(`server is running on port : ${PORT}`)
    );
  })
  .catch((error) => console.log("mongo db connection failed !!!", error));
