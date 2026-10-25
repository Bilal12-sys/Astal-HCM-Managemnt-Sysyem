import mongoose from "mongoose";
import { isoDateValidator } from "./validators.js";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmEmployee", required: true },
    date: { type: String, required: true, validate: isoDateValidator },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    hoursWorked: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["present", "late", "half_day", "absent", "missing_checkout", "on_leave"] },
    isLate: { type: Boolean, default: false },
    source: { type: String, enum: ["web", "camera", "correction"], default: "web" },
  },
  { timestamps: true, collection: "hcm_attendance" }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

const Attendance = mongoose.model("HcmAttendance", attendanceSchema);

export default Attendance;
