import { query } from "express-validator";
import { isIsoDate } from "../../utils/time.js";

export const auditQueryValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("action").optional().isString().trim().isLength({ max: 100 }),
  query("actor").optional().isMongoId(),
  query("from")
    .optional()
    .custom(isIsoDate)
    .withMessage("from must be a valid YYYY-MM-DD date"),
  query("to")
    .optional()
    .custom(isIsoDate)
    .withMessage("to must be a valid YYYY-MM-DD date"),
];
