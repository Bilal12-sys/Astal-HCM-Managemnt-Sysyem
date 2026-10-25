import bcrypt from "bcryptjs";
import AppError from "../../utils/AppError.js";
import AuditLog from "../../models/audit.model.js";
import LeaveType from "../../models/leaveType.model.js";
import Settings from "../../models/settings.model.js";
import User from "../../models/user.model.js";

const defaultLeaveTypes = [
  { name: "annual", yearlyQuota: 14 },
  { name: "sick", yearlyQuota: 8 },
  { name: "casual", yearlyQuota: 10 },
  { name: "unpaid", yearlyQuota: null },
];

export const initializeOrganization = async (companyName) => {
  await Settings.findOneAndUpdate(
    { key: "company" },
    { $setOnInsert: { companyName } },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  for (const leaveType of defaultLeaveTypes) {
    await LeaveType.updateOne(
      { name: leaveType.name },
      { $setOnInsert: leaveType },
      { upsert: true, runValidators: true }
    );
  }
};

export const getSetupStatus = async () => ({
  needsSetup: !(await User.exists({ role: "admin" })),
});

export const createInitialAdmin = async ({ companyName, adminName, email, password }) => {
  if (await User.exists({ role: "admin" })) {
    throw new AppError("Initial setup has already been completed", 403);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  let user;

  try {
    user = await User.create({
      name: adminName.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "admin",
      firstAdminKey: "first-admin",
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Initial setup has already been completed", 403);
    }

    throw error;
  }

  await initializeOrganization(companyName.trim());
  await AuditLog.create({
    actor: user._id,
    action: "setup.completed",
    entity: "User",
    before: null,
    after: { id: user._id, email: user.email, role: user.role },
  });

  return user;
};

export const createAdminFromEnvironment = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (await User.exists({ role: "admin" })) {
    await initializeOrganization(process.env.COMPANY_NAME?.trim() || "My Company");
    return null;
  }

  if (!email || !password) {
    return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address");
  }

  if (password.length < 8 || password.length > 128) {
    throw new Error("ADMIN_PASSWORD must contain between 8 and 128 characters");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let user;

  try {
    user = await User.create({
      name: process.env.ADMIN_NAME?.trim() || "Admin",
      email,
      passwordHash,
      role: "admin",
      firstAdminKey: "first-admin",
    });
  } catch (error) {
    if (error.code === 11000 && (await User.exists({ role: "admin" }))) {
      return null;
    }

    throw error;
  }

  const companyName = process.env.COMPANY_NAME?.trim() || "My Company";
  await initializeOrganization(companyName);
  await AuditLog.create({
    actor: user._id,
    action: "setup.completed",
    entity: "User",
    before: null,
    after: { id: user._id, email: user.email, role: user.role, source: "environment" },
  });

  return user;
};
