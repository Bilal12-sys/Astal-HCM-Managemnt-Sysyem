import { isIsoDate, isIsoMonth } from "../utils/time.js";

export const isoDateValidator = {
  validator: isIsoDate,
  message: "Date must be a valid YYYY-MM-DD value",
};

export const optionalIsoDateValidator = {
  validator: (value) => value === null || isIsoDate(value),
  message: "Date must be null or a valid YYYY-MM-DD value",
};

export const isoMonthValidator = {
  validator: isIsoMonth,
  message: "Month must be a valid YYYY-MM value",
};
