import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import mongoose from "mongoose";

const broadcastToParticipants = (participantIds, event, payload) => {
    const socketIds = [...new Set(participantIds
        .map((participantId) => getReceiverSocketId(participantId.toString()))
        .filter(Boolean))];

    if (socketIds.length) {
        io.to(socketIds).emit(event, payload);
    }
};

export const sendMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {message, replyTo} = req.body;
        const content = typeof message === "string" ? message.trim() : "";

        if (!content) {
            return res.status(400).json({ message: "Message cannot be empty." });
        }
        if (!mongoose.isValidObjectId(receiverId)) {
            return res.status(400).json({ message: "Invalid recipient." });
        }

        let gotConversation = await Conversation.findOne({
            participants:{$all : [senderId, receiverId]},
        });

        if(!gotConversation){
            gotConversation = await Conversation.create({
                participants:[senderId, receiverId]
            })
        };

        let replyMessage = null;
        if (replyTo) {
            if (!mongoose.isValidObjectId(replyTo)) {
                return res.status(400).json({ message: "Invalid reply target." });
            }
            replyMessage = await Message.findOne({
                $and: [
                    { _id: replyTo },
                    { _id: { $in: gotConversation.messages } }
                ]
            });
            if (!replyMessage) {
                return res.status(404).json({ message: "The message being replied to was not found." });
            }
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message: content,
            replyTo: replyMessage?._id || null
        });

        gotConversation.messages.push(newMessage._id);
        await gotConversation.save();
        await newMessage.populate("replyTo");

        broadcastToParticipants([senderId, receiverId], "newMessage", newMessage);
        return res.status(201).json({
            newMessage
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Unable to send message." });
    }
}
export const getMessage = async (req,res) => {
    try {
        const receiverId = req.params.id;
        const senderId = req.id;
        const conversation = await Conversation.findOne({
            participants:{$all : [senderId, receiverId]}
        }).populate({
            path: "messages",
            populate: { path: "replyTo" }
        });
        return res.status(200).json(conversation?.messages);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Unable to load messages." });
    }
}

export const editMessage = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid message." });
        }
        const content = typeof req.body.message === "string" ? req.body.message.trim() : "";
        if (!content) {
            return res.status(400).json({ message: "Message cannot be empty." });
        }

        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }
        if (!message.senderId.equals(req.id)) {
            return res.status(403).json({ message: "You can only edit your own messages." });
        }

        const conversation = await Conversation.findOne({
            participants: { $all: [message.senderId, message.receiverId] },
            messages: message._id
        });
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        const now = Date.now();
        const createdAt = message.createdAt?.getTime();
        if (!createdAt || now - createdAt > 2 * 60 * 1000 || now < createdAt) {
            return res.status(400).json({ message: "Messages can only be edited within two minutes of sending." });
        }

        message.message = content;
        message.editedAt = new Date(now);
        await message.save();
        await message.populate("replyTo");

        broadcastToParticipants([message.senderId, message.receiverId], "messageUpdated", message);
        return res.status(200).json({ message });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Unable to edit message." });
    }
};

export const unsendMessage = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid message." });
        }
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }
        if (!message.senderId.equals(req.id)) {
            return res.status(403).json({ message: "You can only unsend your own messages." });
        }

        const conversation = await Conversation.findOneAndUpdate(
            {
                participants: { $all: [message.senderId, message.receiverId] },
                messages: message._id
            },
            { $pull: { messages: message._id } },
            { new: true }
        );
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        await Message.deleteOne({ _id: message._id });
        const payload = {
            _id: message._id.toString(),
            senderId: message.senderId.toString(),
            receiverId: message.receiverId.toString()
        };
        broadcastToParticipants([message.senderId, message.receiverId], "messageDeleted", payload);
        return res.status(200).json({ message: payload });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Unable to unsend message." });
    }
};