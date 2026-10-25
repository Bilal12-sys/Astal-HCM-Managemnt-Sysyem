import multer from "multer";
import AppError from "../utils/AppError.js";

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!file.originalname.toLowerCase().endsWith(".csv") || file.mimetype !== "text/csv") {
      return callback(new AppError("Upload a CSV file", 400));
    }

    return callback(null, true);
  },
});

export default csvUpload;
