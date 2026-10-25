import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "HcmUser", required: true },
    action: { type: String, required: true, trim: true },
    entity: { type: String, required: true, trim: true },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true, collection: "hcm_audit_logs" }
);

auditSchema.index({ createdAt: 1 });

const AuditLog = mongoose.model("HcmAuditLog", auditSchema);

export default AuditLog;
