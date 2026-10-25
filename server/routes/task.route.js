import express from "express"

import Create_task from "../controllers/task/createtask.controller.js"
import Delete_task from "../controllers/task/deletetask.controller.js"
import Update_task from "../controllers/task/updatetask.controller.js"
import Get_All_tasks from "../controllers/task/getalltask.controller.js"
import Get_Single_task from "../controllers/task/singletask.controller.js"

const Task_Router = express.Router()

Task_Router.get("/tasks" , Get_All_tasks)
Task_Router.post("/tasks", Create_task)
Task_Router.get("/task/:id" , Get_Single_task)
Task_Router.put("/task/:id", Update_task)
Task_Router.delete("/task/:id", Delete_task)


export default Task_Router