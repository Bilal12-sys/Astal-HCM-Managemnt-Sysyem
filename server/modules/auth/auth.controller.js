import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/response.js";
import { changePassword, getCurrentUser, login } from "./auth.service.js";

export const signIn = asyncHandler(async (req, res) => {
  const data = await login(req.body);
  return successResponse(res, data);
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user._id);
  return successResponse(res, { user });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const user = await changePassword({
    userId: req.user._id,
    oldPassword: req.body.oldPassword,
    newPassword: req.body.newPassword,
  });
  return successResponse(res, { user, message: "Password changed successfully" });
});

export const logout = asyncHandler(async (req, res) =>
  successResponse(res, { message: "Logged out successfully" })
);
