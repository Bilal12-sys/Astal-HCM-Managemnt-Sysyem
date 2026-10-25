import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "HcmUser", required: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "hcm_notifications" }
);

notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model("HcmNotification", notificationSchema);

export default Notification;
