import { body } from "express-validator";

export const setupValidation = [
  body("companyName").isString().trim().isLength({ min: 1, max: 120 }),
  body("adminName").isString().trim().isLength({ min: 1, max: 100 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 8, max: 128 }),
];
