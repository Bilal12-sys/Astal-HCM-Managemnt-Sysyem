import mongoose from "mongoose";
import { isoDateValidator } from "./validators.js";

const attendanceCorrectionSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmEmployee", required: true },
    date: { type: String, required: true, validate: isoDateValidator },
    reason: { type: String, required: true, trim: true },
    requestedCheckIn: { type: Date, default: null },
    requestedCheckOut: { type: Date, default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "HcmUser", default: null },
    comment: { type: String, default: "" },
  },
  { timestamps: true, collection: "hcm_attendance_corrections" }
);

const AttendanceCorrection = mongoose.model("HcmAttendanceCorrection", attendanceCorrectionSchema);

export default AttendanceCorrection;
