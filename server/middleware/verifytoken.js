import jwt from "jsonwebtoken";

const Verify_token = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
        ? authorization.slice(7).trim()
        : "";

    if (!token) {
        return res.status(401).send({
            success: false,
            message: "Authentication token required",
        });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("JWT_SECRET is not configured");
        return res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }

    try {
        req.user = jwt.verify(token, secret, { algorithms: ["HS256"] });
        next();
    } catch {
        res.status(401).send({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default Verify_token;
