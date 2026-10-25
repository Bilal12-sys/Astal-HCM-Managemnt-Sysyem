import { Router } from "express";
import validateRequest from "../../middleware/validate.js";
import { getStatus, setup } from "./setup.controller.js";
import { setupValidation } from "./setup.validation.js";

const router = Router();

router.get("/status", getStatus);
router.post("/", setupValidation, validateRequest, setup);

export default router;
