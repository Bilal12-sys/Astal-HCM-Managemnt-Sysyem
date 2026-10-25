import Create_task_service from "../../servces/task/createtask.service.js";

const Create_task = async (req, res) => {
    try {
        const data = await Create_task_service(req.body);
        res.status(201).send({
            success: true,
            message: "Task created successfully",
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

export default Create_task;
