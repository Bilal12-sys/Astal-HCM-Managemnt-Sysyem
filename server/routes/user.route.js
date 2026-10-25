import express from "express";
import Login from "../controllers/login/login.controller.js";
import Create_user from "../controllers/user/createuser.controller.js";
import Delete_user from "../controllers/user/deleteuser.controller.js";
import Get_all_user from "../controllers/user/getalluser.controller.js";
import Get_single_user from "../controllers/user/singleuser.controller.js";
import Update_user from "../controllers/user/updateuser.controller.js";

const User_Router = express.Router();

User_Router.post("/login", Login);
User_Router.get("/users", Get_all_user);
User_Router.post("/users", Create_user);
User_Router.get("/user/:id", Get_single_user);
User_Router.put("/user/:id", Update_user);
User_Router.delete("/user/:id", Delete_user);

export default User_Router;
