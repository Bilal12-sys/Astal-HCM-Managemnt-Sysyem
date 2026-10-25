import AppError from "../../utils/AppError.js";
import AuditLog from "../../models/audit.model.js";

export const listAuditLogs = async ({ page = 1, limit = 20, action, actor, from, to }) => {
  if (from && to && from > to) {
    throw new AppError("from must be before or equal to to", 400);
  }

  const currentPage = Number(page);
  const pageLimit = Math.min(Number(limit), 100);
  const filter = {};

  if (action) {
    filter.action = action.trim();
  }

  if (actor) {
    filter.actor = actor;
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) {
      filter.createdAt.$gte = new Date(`${from}T00:00:00.000+05:00`);
    }
    if (to) {
      filter.createdAt.$lte = new Date(`${to}T23:59:59.999+05:00`);
    }
  }

  const [entries, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("actor", "name email role")
      .sort({ createdAt: -1, _id: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit),
    AuditLog.countDocuments(filter),
  ]);

  return { entries, meta: { page: currentPage, limit: pageLimit, total } };
};
