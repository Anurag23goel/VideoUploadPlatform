import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGO_DB_URI
    );
    console.log(
      `DataBase Connected || DataBase Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error in connecting to DataBase");
  }
};

export default connectDB;
