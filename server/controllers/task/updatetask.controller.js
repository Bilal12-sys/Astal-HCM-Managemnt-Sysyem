import Update_task_service from "../../servces/task/updatetask.service.js";

const Update_task = async (req, res) => {
    try {
        const data = await Update_task_service(req.params.id, req.body);

        if (!data) {
            return res.status(404).send({
                success: false,
                message: "Task not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Task updated successfully",
            data,
        });
    } catch (err) {
        console.error(err);
        const status = err.name === "ValidationError" || err.name === "CastError" ? 400 : 500;
        res.status(status).send({
            success: false,
            message: status === 400 ? err.message : "Internal server error",
        });
    }
};

export default Update_task;
