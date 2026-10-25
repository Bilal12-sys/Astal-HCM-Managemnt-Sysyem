import Get_all_user_service from "../../servces/user/getalluser.service.js";

const Get_all_user = async (req, res) => {
    try {
        const data = await Get_all_user_service();
        res.status(200).send({
            success: true,
            message: "All users fetched successfully",
            data,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

export default Get_all_user;
