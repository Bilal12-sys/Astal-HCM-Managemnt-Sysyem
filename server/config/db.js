import mongoose from "mongoose";
import chalk from "chalk";

const connectdb = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log(chalk.bgGreen("MongoDB connected"));
  } catch (err) {
    console.error(chalk.bgRed("MongoDB error"), err);
    throw err;
  }
};

export default connectdb;