import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import { failureResponse } from "../utils/response.js";

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return failureResponse(res, error.message, error.status, error.errors, error.code);
  }

  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return failureResponse(res, "Invalid request data", 400);
  }

  if (error.code === 11000) {
    return failureResponse(res, "A record with this value already exists", 409);
  }

  if (error.type === "entity.too.large") {
    return failureResponse(res, "Request body exceeds the 1 MB limit", 413);
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    console.error("Unexpected request error");
  }

  return failureResponse(res, "Internal server error", 500);
};

export default errorHandler;
