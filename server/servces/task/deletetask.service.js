import { Tasks } from "../../model/task.model.js";

const Delete_task_service = (id) => Tasks.findByIdAndDelete(id);

export default Delete_task_service;
