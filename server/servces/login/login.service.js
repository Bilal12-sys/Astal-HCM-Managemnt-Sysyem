import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../model/user.model.js";

const Login_service = async (email, password) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return null;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
        { id: user._id.toString() },
        secret,
        { expiresIn: "1d", algorithm: "HS256" }
    );

    return {
        token,
        user: user.toJSON(),
    };
};

export default Login_service;
