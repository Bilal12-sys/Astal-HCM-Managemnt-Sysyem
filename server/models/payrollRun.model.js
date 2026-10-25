import mongoose from "mongoose";
import { isoMonthValidator } from "./validators.js";

const payrollRunSchema = new mongoose.Schema(
  {
    month: { type: String, required: true, unique: true, validate: isoMonthValidator },
    status: { type: String, enum: ["draft", "finalized"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "HcmUser", required: true },
    finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "HcmUser", default: null },
    finalizedAt: { type: Date, default: null },
    totals: {
      gross: { type: Number, default: 0 },
      deductions: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      net: { type: Number, default: 0 },
    },
  },
  { timestamps: true, collection: "hcm_payroll_runs" }
);

const PayrollRun = mongoose.model("HcmPayrollRun", payrollRunSchema);

export default PayrollRun;
