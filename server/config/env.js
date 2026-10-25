import AppError from "../utils/AppError.js";

const validateEnvironment = () => {
  const missing = ["MONGO_URI", "JWT_SECRET"].filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new AppError(`Missing required environment variables: ${missing.join(", ")}`, 500);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new AppError("JWT_SECRET must be at least 32 characters", 500);
  }
};

export default validateEnvironment;
