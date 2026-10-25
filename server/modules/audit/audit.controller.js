import asyncHandler from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/response.js";
import { listAuditLogs } from "./audit.service.js";

const getAudit = asyncHandler(async (req, res) => {
  const { entries, meta } = await listAuditLogs(req.query);
  return successResponse(res, entries, 200, meta);
});

export default getAudit;
