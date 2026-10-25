import Update_user_service from "../../servces/user/updateuser.service.js";

const Update_user = async (req, res) => {
    try {
        const data = await Update_user_service(req.params.id, req.body);

        if (!data) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "User updated successfully",
            data,
        });
    } catch (err) {
        console.error(err);
        const status = err.code === 11000
            ? 409
            : err.name === "ValidationError" || err.name === "CastError" ? 400 : 500;
        res.status(status).send({
            success: false,
            message: status === 409
                ? "Username or email already exists"
                : status === 400 ? "Invalid user data" : "Internal server error",
        });
    }
};

export default Update_user;
