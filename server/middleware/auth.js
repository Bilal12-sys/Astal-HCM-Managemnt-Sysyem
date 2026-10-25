import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

const auth = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  if (!token) {
    return next(new AppError("Authentication token required", 401));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    const user = await User.findById(payload.id);

    if (!user || !user.isActive) {
      return next(new AppError("User account is unavailable", 401));
    }

    const requestPath = req.originalUrl.split("?")[0];
    const allowedPasswordRoutes = [
      ["GET", "/auth/me"],
      ["POST", "/auth/change-password"],
      ["POST", "/auth/logout"],
    ];
    const isAllowedPasswordRoute = allowedPasswordRoutes.some(
      ([method, path]) => req.method === method && requestPath.endsWith(path)
    );

    if (user.mustChangePassword && !isAllowedPasswordRoute) {
      return next(
        new AppError("Change your temporary password before continuing", 403, "PASSWORD_CHANGE_REQUIRED")
      );
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Invalid or expired token", 401));
    }

    return next(error);
  }
};

export default auth;
