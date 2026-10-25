import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/response.js";
import { createInitialAdmin, getSetupStatus } from "./setup.service.js";

export const getStatus = asyncHandler(async (req, res) => {
  const data = await getSetupStatus();
  return successResponse(res, data);
});

export const setup = asyncHandler(async (req, res) => {
  const user = await createInitialAdmin(req.body);
  return successResponse(res, { user }, 201);
});
