import Single_user_service from "../../servces/user/singleuser.service.js";

const Get_single_user = async (req, res) => {
    try {
        const data = await Single_user_service(req.params.id);

        if (!data) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "User fetched successfully",
            data,
        });
    } catch (err) {
        console.error(err);
        const status = err.name === "CastError" ? 400 : 500;
        res.status(status).send({
            success: false,
            message: status === 400 ? "Invalid user id" : "Internal server error",
        });
    }
};

export default Get_single_user;
