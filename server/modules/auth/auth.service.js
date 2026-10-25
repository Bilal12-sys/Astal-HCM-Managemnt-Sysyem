import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../../utils/AppError.js";
import { writeAudit } from "../../utils/audit.js";
import User from "../../models/user.model.js";

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("User account is unavailable", 401);
  }

  user.lastLoginAt = new Date();
  await user.save();
  await writeAudit({
    actor: user._id,
    action: "auth.login",
    entity: "User",
    before: null,
    after: { id: user._id, role: user.role, lastLoginAt: user.lastLoginAt },
  });

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d", algorithm: "HS256" }
  );

  return { token, user };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new AppError("User account is unavailable", 401);
  }

  return user;
};

export const changePassword = async ({ userId, oldPassword, newPassword }) => {
  if (oldPassword === newPassword) {
    throw new AppError("New password must differ from the current password", 400);
  }

  const user = await User.findById(userId).select("+passwordHash");

  if (!user || !user.isActive) {
    throw new AppError("User account is unavailable", 401);
  }

  if (!(await bcrypt.compare(oldPassword, user.passwordHash))) {
    throw new AppError("Current password is incorrect", 401);
  }

  const before = { mustChangePassword: user.mustChangePassword };
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.mustChangePassword = false;
  await user.save();
  await writeAudit({
    actor: user._id,
    action: "auth.password_changed",
    entity: "User",
    before,
    after: { mustChangePassword: user.mustChangePassword },
  });

  return user;
};
