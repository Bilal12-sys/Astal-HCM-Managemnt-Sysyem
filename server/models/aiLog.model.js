import mongoose from "mongoose";

const aiLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmUser", required: true },
    role: { type: String, required: true, enum: ["admin", "hr", "employee"] },
    question: { type: String, required: true, trim: true },
    toolUsed: { type: String, default: null },
    ok: { type: Boolean, required: true },
    ms: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, collection: "hcm_ai_logs" }
);

const AiLog = mongoose.model("HcmAiLog", aiLogSchema);

export default AiLog;
