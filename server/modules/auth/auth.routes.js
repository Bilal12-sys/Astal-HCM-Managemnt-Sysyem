import { Router } from "express";
import auth from "../../middleware/auth.js";
import { loginRateLimit } from "../../middleware/rateLimit.js";
import validateRequest from "../../middleware/validate.js";
import { logout, me, signIn, updatePassword } from "./auth.controller.js";
import { changePasswordValidation, loginValidation } from "./auth.validation.js";

const router = Router();

router.post("/login", loginRateLimit, loginValidation, validateRequest, signIn);
router.get("/me", auth, me);
router.post("/change-password", auth, changePasswordValidation, validateRequest, updatePassword);
router.post("/logout", auth, logout);

export default router;
