import { Tasks } from "../../model/task.model.js";

const Create_task_service = (data) => Tasks.create(data);

export default Create_task_service;
