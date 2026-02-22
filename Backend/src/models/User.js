import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        default: ""
    },
    email:{
        type: String,
        default: ""
    },
    profileImage:{
        type: String,
        default: ""
    },
    clerkId:{
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;