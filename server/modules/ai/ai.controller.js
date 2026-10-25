import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/response.js";
import { askAssistant } from "./ai.service.js";

export const chat = asyncHandler(async (req, res) => {
  const data = await askAssistant({ user: req.user, message: req.body.message });
  return successResponse(res, data);
});
