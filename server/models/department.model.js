import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true, collection: "hcm_departments" }
);

const Department = mongoose.model("HcmDepartment", departmentSchema);

export default Department;
