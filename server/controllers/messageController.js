import Message from "../models/messageModel.js";
import { v2 as cloudinary } from "cloudinary";

import Conversation from "../models/conversationModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
async function sendMessage(req, res) {
  try {
    const { recipientId, message } = req.body;
    let { image } = req.body;

    let { video } = req.body;

    const senderId = req.user._id;
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    let uploadedImageResponse, uploadedVideoResponse;

    if (image) {
      try {
        uploadedImageResponse = await cloudinary.uploader.upload(image, {
          resource_type: "image",
        });
        image = uploadedImageResponse.secure_url;
      } catch (imageUploadError) {
        console.error("Image upload error:", imageUploadError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    if (video) {
      try {
        uploadedVideoResponse = await cloudinary.uploader.upload(video, {
          resource_type: "video",
        });
        video = uploadedVideoResponse.secure_url;
      } catch (videoUploadError) {
        console.error("Video upload error:", videoUploadError);
        return res.status(500).json({ error: "Failed to upload video" });
      }
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      image: image || "",
      video: video || "",
    });
    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);

    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
}

async function getMessages(req, res) {
  const { otherUserId } = req.params;
  const userId = req.user._id;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getConversations(req, res) {
  const userId = req.user._id;
  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate({
      path: "participants",
      select: "username profilePic",
    });

    //remove the current user from the participants array
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export { sendMessage, getMessages, getConversations };
