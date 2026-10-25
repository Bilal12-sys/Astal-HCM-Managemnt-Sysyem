import Create_user_service from "../../servces/user/createuser.service.js";
import { User } from "../../utils/User.js";

const Create_user = async (req, res) => {
    try {
        const data = await Create_user_service(req.body);
        User.push(data.toJSON());

        res.status(201).send({
            success: true,
            message: "User created successfully",
            data,
        });
    } catch (err) {
        console.error(err);
        const status = err.code === 11000
            ? 409
            : err.name === "ValidationError" || err.name === "TypeError" ? 400 : 500;
        res.status(status).send({
            success: false,
            message: status === 409
                ? "Username or email already exists"
                : status === 400 ? "Invalid user data" : "Internal server error",
        });
    }
};

export default Create_user;
