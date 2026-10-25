import bcrypt from "bcrypt";
import User from "../../model/user.model.js";

const Update_user_service = async (id, data) => {
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    return User.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    }).select("-password");
};

export default Update_user_service;
