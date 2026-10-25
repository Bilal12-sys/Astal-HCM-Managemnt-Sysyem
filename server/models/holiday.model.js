import mongoose from "mongoose";
import { isoDateValidator } from "./validators.js";

const holidaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true, validate: isoDateValidator },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true, collection: "hcm_holidays" }
);

const Holiday = mongoose.model("HcmHoliday", holidaySchema);

export default Holiday;
