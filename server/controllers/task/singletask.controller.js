import Single_task_service from "../../servces/task/singletask.service.js";

const Get_Single_task = async (req, res) => {
    try {
        const data = await Single_task_service(req.params.id);

        if (!data) {
            return res.status(404).send({
                success: false,
                message: "Task not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Task fetched successfully",
            data,
        });
    } catch (err) {
        console.error(err);
        const status = err.name === "CastError" ? 400 : 500;
        res.status(status).send({
            success: false,
            message: status === 400 ? "Invalid task id" : "Internal server error",
        });
    }
};

export default Get_Single_task;
