import Delete_task_service from "../../servces/task/deletetask.service.js";

const Delete_task = async (req, res) => {
    try {
        const data = await Delete_task_service(req.params.id);

        if (!data) {
            return res.status(404).send({
                success: false,
                message: "Task not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Task deleted successfully",
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

export default Delete_task;
