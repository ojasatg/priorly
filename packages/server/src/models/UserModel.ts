import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "A valid email is required"],
            unique: [true, "Email already taken, please use a different email"],
            lowercase: [true], // converts the value to lower case before storing
        },
        password: {
            type: String,
            required: [true, "A valid password is required"],
        },

        name: { type: String, required: false, default: "" },
    },
    { timestamps: true },
);

// Add virtual fields
UserSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

UserSchema.virtual("createdOn").get(function () {
    return new Date(this.createdAt).getTime() / 1000;
});
UserSchema.virtual("updatedOn").get(function () {
    return new Date(this.updatedAt).getTime() / 1000;
});

// Ensure virtual fields are serialised.
UserSchema.set("toJSON", {
    virtuals: true,
});

const UserModel = mongoose.model("Users", UserSchema);

export default UserModel;
