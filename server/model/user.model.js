import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
        },
        gender: {
            type: String,
            required: true,
            enum: ["male", "female", "other"],
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                delete ret.password;
                return ret;
            },
        },
        toObject: {
            transform(_doc, ret) {
                delete ret.password;
                return ret;
            },
        },
    }
);

const User = mongoose.model("User", userSchema);

export default User;
