import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "A valid email is required"],
            unique: [true],
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

// Hooks
// Post means after saving the document
UserSchema.post("save", function (_doc, next) {
    // 'save' means save event
    // 'doc' is the saved document
    next(); // this is important for control flow
});

// Pre means before creation
UserSchema.pre("save", async function (next) {
    // We don't get the saved "document" in pre hooks, we get the "this" keyword.

    const salt = await bcrypt.genSalt(); // generates a salt
    this.password = await bcrypt.hash(this.password, salt); // hashes the password

    next();
});

const UserModel = mongoose.model("Users", UserSchema);

export default UserModel;
