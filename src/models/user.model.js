import jsonwebtoken from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            unique: true,
        },
        cover: {
            type: String
        },
        watchHistory: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        password: {
            type: String,
            required: [true, 'password is required'],
        },
        refreshToken: {
            type: String
        }
    }, {
    timestamps: true
}
)
// userSchema.pre(("save",function (next){
//     if(!this.isModified("password")) return next();

//     this.password = bcrypt.hash(this.password,10);
//     next();
// }))         //here we use normal function not arrow function because here we need reference


userSchema.method.checkPassword = async () => {
    return await bcrypt.compare(password, this.password);
}


userSchema.methods.generateAccessToken = () => {
    return jsonwebtoken.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresin: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = () => {
    jsonwebtoken.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresin: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema);
