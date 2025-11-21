import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDB Connection SUCCESS! with host ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(`MongoDB Connection FAILED! due to ${error}`);
    process.exit(1);
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected SUCCESS!");
    process.exit(0);
  } catch (error) {
    console.log(`MongoDB Failed to Disconnect due to ${error}`);
    console.log("Retrying again..");
    disconnectDB();
  }
}

export { connectDB, disconnectDB };
