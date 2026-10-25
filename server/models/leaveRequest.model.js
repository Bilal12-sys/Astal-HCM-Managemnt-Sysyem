import mongoose from "mongoose";
import { isoDateValidator } from "./validators.js";

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmEmployee", required: true },
    type: { type: String, required: true, trim: true, lowercase: true },
    startDate: { type: String, required: true, validate: isoDateValidator },
    endDate: { type: String, required: true, validate: isoDateValidator },
    days: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "HcmUser", default: null },
    comment: { type: String, default: "" },
  },
  { timestamps: true, collection: "hcm_leave_requests" }
);

leaveRequestSchema.index({ employeeId: 1, status: 1 });

const LeaveRequest = mongoose.model("HcmLeaveRequest", leaveRequestSchema);

export default LeaveRequest;
