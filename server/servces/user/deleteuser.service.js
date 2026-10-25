import User from "../../model/user.model.js";

const Delete_user_service = (id) =>
    User.findByIdAndDelete(id).select("-password");

export default Delete_user_service;
