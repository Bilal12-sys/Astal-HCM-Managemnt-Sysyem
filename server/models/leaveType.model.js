import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    yearlyQuota: { type: Number, default: null, min: 0 },
  },
  { timestamps: true, collection: "hcm_leave_types" }
);

const LeaveType = mongoose.model("HcmLeaveType", leaveTypeSchema);

export default LeaveType;
