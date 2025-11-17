import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_URI}/${DB_NAME}`
    );
    console.log(connectionInstance);
  } catch (error) {
    console.error(`MongoDB Connection FAILED! with ${error}`);
    process.exit(1);
  }
}

export default connectDB;
