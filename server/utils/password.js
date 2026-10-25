import { randomBytes } from "node:crypto";

export const generateTemporaryPassword = (length = 16) => {
  if (!Number.isInteger(length) || length < 8 || length > 128) {
    throw new RangeError("length must be an integer between 8 and 128");
  }

  return randomBytes(length).toString("base64url").slice(0, length);
};
