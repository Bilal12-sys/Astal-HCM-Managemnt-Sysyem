import { Router } from "express";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validate.js";
import { chat } from "./ai.controller.js";
import { chatValidation } from "./ai.validation.js";

const router = Router();

router.post("/chat", auth, chatValidation, validateRequest, chat);

export default router;
