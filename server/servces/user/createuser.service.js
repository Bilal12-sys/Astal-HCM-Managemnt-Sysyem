import bcrypt from "bcrypt";
import User from "../../model/user.model.js";

const Create_user_service = async (data) => {
    const password = await bcrypt.hash(data.password, 10);
    return User.create({ ...data, password });
};

export default Create_user_service;
