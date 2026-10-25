import { body } from "express-validator";

export const chatValidation = [
  body("message").isString().trim().isLength({ min: 1, max: 4000 }),
];
