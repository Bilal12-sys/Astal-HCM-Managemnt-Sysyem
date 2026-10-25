import AuditLog from "../models/audit.model.js";

export const writeAudit = ({ actor, action, entity, before = null, after = null }) =>
  AuditLog.create({ actor, action, entity, before, after });
