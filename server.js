import connectDB from "./db/connection.js";
import dotenv from "dotenv";
import { app } from "./app.js";


dotenv.config({
    path: "./.env",
});
const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is Up and Listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("Error");
  });

