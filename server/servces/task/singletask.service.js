import { Tasks } from "../../model/task.model.js";

const Single_task_service = (id) => Tasks.findById(id);

export default Single_task_service;
