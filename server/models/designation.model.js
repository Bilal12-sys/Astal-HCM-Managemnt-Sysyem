import mongoose from "mongoose";

const designationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmDepartment", required: true },
  },
  { timestamps: true, collection: "hcm_designations" }
);

designationSchema.index({ name: 1, departmentId: 1 }, { unique: true });

const Designation = mongoose.model("HcmDesignation", designationSchema);

export default Designation;
