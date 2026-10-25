import mongoose from "mongoose";
import { isoMonthValidator } from "./validators.js";

const payslipSchema = new mongoose.Schema(
  {
    runId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmPayrollRun", required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmEmployee", required: true },
    month: { type: String, required: true, validate: isoMonthValidator },
    basic: { type: Number, required: true, min: 0 },
    gross: { type: Number, required: true, min: 0 },
    earnedGross: { type: Number, required: true, min: 0 },
    workingDays: { type: Number, required: true, min: 0 },
    employedDays: { type: Number, required: true, min: 0 },
    absentDays: { type: Number, default: 0, min: 0 },
    unpaidDays: { type: Number, default: 0, min: 0 },
    halfDays: { type: Number, default: 0, min: 0 },
    deduction: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    net: { type: Number, required: true },
  },
  { timestamps: true, collection: "hcm_payslips" }
);

payslipSchema.index({ runId: 1, employeeId: 1 }, { unique: true });

const Payslip = mongoose.model("HcmPayslip", payslipSchema);

export default Payslip;
