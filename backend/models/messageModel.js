import mongoose from "mongoose";

const messageModel = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    message:{
        type:String,
        required:true
    },
    replyTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message",
        default:null
    },
    editedAt:{
        type:Date,
        default:null
    }
},{timestamps:true});
export const Message = mongoose.model("Message", messageModel);