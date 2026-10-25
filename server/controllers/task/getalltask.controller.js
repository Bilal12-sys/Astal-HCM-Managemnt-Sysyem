import Get_tasks_service from "../../servces/task/getalltask.service.js";

const Get_All_tasks = async (req, res) => {
    try {
        const data = await Get_tasks_service();
        res.status(200).send({
            success: true,
            message: "All tasks fetched successfully",
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

export default Get_All_tasks;
