import User from "../../model/user.model.js";

const Single_user_service = (id) => User.findById(id).select("-password");

export default Single_user_service;
