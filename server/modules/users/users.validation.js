import { body, param, query } from "express-validator";

export const createHrValidation = [
  body("name").isString().trim().isLength({ min: 1, max: 100 }),
  body("email").isEmail().normalizeEmail(),
];

export const userIdValidation = [param("id").isMongoId()];

export const listUsersValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("role").optional().isIn(["admin", "hr", "employee"]),
  query("search").optional().isString().trim().isLength({ max: 100 }),
];
