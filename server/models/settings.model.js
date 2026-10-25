import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "company", unique: true, immutable: true },
    companyName: { type: String, required: true, trim: true },
    officeStart: { type: String, default: "09:00", match: /^\d{2}:\d{2}$/ },
    graceMinutes: { type: Number, default: 15, min: 0 },
    halfDayHours: { type: Number, default: 5, min: 0 },
    weekend: { type: [String], default: ["Sat", "Sun"], enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    officeLat: { type: Number, default: null, min: -90, max: 90 },
    officeLng: { type: Number, default: null, min: -180, max: 180 },
    radiusMeters: { type: Number, default: 150, min: 1 },
    latePenaltyEnabled: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "hcm_settings" }
);

const Settings = mongoose.model("HcmSettings", settingsSchema);

export default Settings;
