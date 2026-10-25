import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ["admin", "hr", "employee"] },
    firstAdminKey: { type: String, select: false, immutable: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmEmployee" },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "hcm_users",
    toJSON: { transform: removePrivateFields },
    toObject: { transform: removePrivateFields },
  },
);

userSchema.index(
  { firstAdminKey: 1 },
  { unique: true, sparse: true, name: "unique_first_admin" }
);

function removePrivateFields(_document, result) {
  delete result.passwordHash;
  delete result.firstAdminKey;
  delete result.__v;
  return result;
}

const User = mongoose.model("HcmUser", userSchema);

export default User;
