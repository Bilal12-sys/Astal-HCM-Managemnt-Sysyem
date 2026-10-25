import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/response.js";
import { createHrUser, listUsers, resetUserPassword, setUserActive } from "./users.service.js";

export const createHr = asyncHandler(async (req, res) => {
  const data = await createHrUser(req.body, req.user._id);
  return successResponse(res, data, 201);
});

export const getUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await listUsers(req.query);
  return successResponse(res, users, 200, meta);
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await setUserActive({ id: req.params.id, active: false, actorId: req.user._id });
  return successResponse(res, { user });
});

export const activateUser = asyncHandler(async (req, res) => {
  const user = await setUserActive({ id: req.params.id, active: true, actorId: req.user._id });
  return successResponse(res, { user });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const data = await resetUserPassword({ id: req.params.id, actorId: req.user._id });
  return successResponse(res, data);
});
