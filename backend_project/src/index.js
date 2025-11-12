import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";

dotenv.config({
  path: "./.env",
});

(async () => {
  try {
    await connectDB();
    const { app } = await import('./app.js');
    const PORT = process.env.PORT || 3000;
    
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.log("Error starting server:", error);
    process.exit(1);
  }
})();