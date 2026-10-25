import bcrypt from "bcryptjs";
import AppError from "../../utils/AppError.js";
import { writeAudit } from "../../utils/audit.js";
import { createNotification } from "../../utils/notify.js";
import { generateTemporaryPassword } from "../../utils/password.js";
import User from "../../models/user.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createHrUser = async ({ name, email }, actorId) => {
  const temporaryPassword = generateTemporaryPassword();
  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(temporaryPassword, 12),
    role: "hr",
    mustChangePassword: true,
  });

  await writeAudit({
    actor: actorId,
    action: "user.created",
    entity: "User",
    before: null,
    after: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
  await createNotification({
    userId: user._id,
    message: "Your HR account has been created. Change your temporary password after signing in.",
    type: "account_created",
  });

  return { user, temporaryPassword };
};

export const listUsers = async ({ page = 1, limit = 20, role, search }) => {
  const currentPage = Number(page);
  const pageLimit = Math.min(Number(limit), 100);
  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (search) {
    const matcher = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ name: matcher }, { email: matcher }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1, _id: 1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit),
    User.countDocuments(filter),
  ]);

  return { users, meta: { page: currentPage, limit: pageLimit, total } };
};

export const setUserActive = async ({ id, active, actorId }) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!active && String(user._id) === String(actorId)) {
    throw new AppError("You cannot deactivate your own account", 409);
  }

  if (user.isActive === active) {
    throw new AppError(`User is already ${active ? "active" : "deactivated"}`, 409);
  }

  const before = { isActive: user.isActive };
  user.isActive = active;
  await user.save();
  await writeAudit({
    actor: actorId,
    action: active ? "user.activated" : "user.deactivated",
    entity: "User",
    before: { id: user._id, ...before },
    after: { id: user._id, isActive: user.isActive },
  });

  return user;
};

export const resetUserPassword = async ({ id, actorId }) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const temporaryPassword = generateTemporaryPassword(24);
  const before = { mustChangePassword: user.mustChangePassword };
  user.passwordHash = await bcrypt.hash(temporaryPassword, 12);
  user.mustChangePassword = true;
  await user.save();
  await writeAudit({
    actor: actorId,
    action: "user.password_reset",
    entity: "User",
    before: { id: user._id, ...before },
    after: { id: user._id, mustChangePassword: user.mustChangePassword },
  });

  return { user, temporaryPassword };
};
