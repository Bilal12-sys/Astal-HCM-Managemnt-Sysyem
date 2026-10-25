import { Tasks } from "../../model/task.model.js";

const Get_tasks_service = () => Tasks.find();

export default Get_tasks_service;
