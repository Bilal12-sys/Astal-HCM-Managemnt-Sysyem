import { body } from "express-validator";

export const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 1, max: 128 }),
];

export const changePasswordValidation = [
  body("oldPassword").isString().isLength({ min: 1, max: 128 }),
  body("newPassword").isString().isLength({ min: 8, max: 128 }),
];
