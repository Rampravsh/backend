import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
dotenv.config();
const PORT = process.env.PORT;
connectDB();

// const connectDB = async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("error: ", error);
//       throw error;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`App is running on port : ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("error:", error);
//   }
// };
// connectDB();
