import { Tasks } from "../../model/task.model.js";

const Update_task_service = (id, data) =>
    Tasks.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });

export default Update_task_service;
