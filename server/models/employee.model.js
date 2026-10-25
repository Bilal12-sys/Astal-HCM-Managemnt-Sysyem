import mongoose from "mongoose";
import { isoDateValidator, optionalIsoDateValidator } from "./validators.js";

const salaryHistorySchema = new mongoose.Schema(
  {
    who: { type: mongoose.Schema.Types.ObjectId, ref: "HcmUser", required: true },
    when: { type: Date, required: true },
    old: { type: Number, default: null },
    new: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmDepartment", required: true },
    designationId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmDesignation", required: true },
    joinDate: { type: String, required: true, validate: isoDateValidator },
    exitDate: { type: String, default: null, validate: optionalIsoDateValidator },
    status: { type: String, required: true, enum: ["active", "probation", "exited"] },
    basicSalary: { type: Number, required: true, validate: (value) => value > 0 },
    salaryHistory: { type: [salaryHistorySchema], default: [] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmUser", required: true, unique: true },
  },
  { timestamps: true, collection: "hcm_employees" }
);

employeeSchema.index({ departmentId: 1, status: 1 });

const Employee = mongoose.model("HcmEmployee", employeeSchema);

export default Employee;
