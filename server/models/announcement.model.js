import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "HcmUser", required: true },
  },
  { timestamps: true, collection: "hcm_announcements" }
);

const Announcement = mongoose.model("HcmAnnouncement", announcementSchema);

export default Announcement;
