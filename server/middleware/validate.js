import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError("Request validation failed", 400, "VALIDATION_ERROR", errors.array()));
  }

  return next();
};

export default validateRequest;
