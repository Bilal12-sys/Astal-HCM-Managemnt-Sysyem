import User from "../../model/user.model.js";

const Get_all_user_service = () => User.find().select("-password");

export default Get_all_user_service;
