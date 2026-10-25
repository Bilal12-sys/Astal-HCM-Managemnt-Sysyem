import { Router } from "express";
import auth from "../../middleware/auth.js";
import requireRole from "../../middleware/requireRole.js";
import validateRequest from "../../middleware/validate.js";
import getAudit from "./audit.controller.js";
import { auditQueryValidation } from "./audit.validation.js";

const router = Router();

router.get("/", auth, requireRole("admin"), auditQueryValidation, validateRequest, getAudit);

export default router;
