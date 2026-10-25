import AppError from "../utils/AppError.js";

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError("You are not allowed to perform this action", 403));
  }

  return next();
};

export default requireRole;
