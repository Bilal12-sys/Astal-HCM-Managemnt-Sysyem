import { Router } from "express";
import auth from "../../middleware/auth.js";
import requireRole from "../../middleware/requireRole.js";
import validateRequest from "../../middleware/validate.js";
import {
  activateUser,
  createHr,
  deactivateUser,
  getUsers,
  resetPassword,
} from "./users.controller.js";
import { createHrValidation, listUsersValidation, userIdValidation } from "./users.validation.js";

const router = Router();

router.use(auth, requireRole("admin"));
router.get("/", listUsersValidation, validateRequest, getUsers);
router.post("/hr", createHrValidation, validateRequest, createHr);
router.patch("/:id/deactivate", userIdValidation, validateRequest, deactivateUser);
router.patch("/:id/activate", userIdValidation, validateRequest, activateUser);
router.post("/:id/reset-password", userIdValidation, validateRequest, resetPassword);

export default router;
