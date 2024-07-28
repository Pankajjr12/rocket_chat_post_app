import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import { getRecipientSocketId, io } from "../socket/socket.js";

const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { image } = req.body;
    let { video } = req.body;
    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "Please fill in the post should not be empty..." });
    }

    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post" });
    }

    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    let uploadedImageResponse, uploadedVideoResponse;
    
    if (image) {
      try {
        uploadedImageResponse = await cloudinary.uploader.upload(image, { resource_type: "image" });
        image = uploadedImageResponse.secure_url;
      } catch (imageUploadError) {
        console.error("Image upload error:", imageUploadError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    if (video) {
      try {
        uploadedVideoResponse = await cloudinary.uploader.upload(video, { resource_type: "video" });
        video = uploadedVideoResponse.secure_url;
      } catch (videoUploadError) {
        console.error("Video upload error:", videoUploadError);
        return res.status(500).json({ error: "Failed to upload video" });
      }
    }

    const newPost = new Post({ postedBy, text, image, video });
    await newPost.save();
    res.status(201).json({ message: "Post created successfully", newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.postedBy.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to delete post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      // Like post
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const reply = { userId, text, userProfilePic, username };

    post.replies.push(reply);
    await post.save();

    res.status(200).json({ message: "Reply added successfully", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;
    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });

    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sharePost = async (req, res) => {

  try {
    const { postId, recipientId } = req.body;

    // Validate recipientId
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Find the post to be shared
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the current user is authorized to share this post
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to share this post" });
    }

    // Create a new message or notification for the recipient
    const message = {
      sender: req.user._id,
      recipient: recipientId,
      content: `@${post.postedBy.username} shared a post`,
      type: 'post_share',
      postId: postId
    };

    // Emit the message via socket
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", message);
    }

    res.status(200).json({ message: "Post shared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const savePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the post is already saved by the user
    if (post.savedBy.includes(userId)) {
      return res.status(400).json({ error: "Post already saved" });
    }

    // Save the post in the Post model
    post.savedBy.push(userId);
    await post.save();

    // Also add the post to the user's savedPosts array
    const user = await User.findById(userId);
    if (!user.savedPosts.includes(postId)) {
      user.savedPosts.push(postId);
      await user.save();
    }

    res.status(200).json({ message: "Post saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unsavePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the post is saved by the user
    if (!post.savedBy.includes(userId)) {
      return res.status(400).json({ error: "Post not saved by user" });
    }

    // Unsave the post in the Post model
    post.savedBy = post.savedBy.filter(id => id.toString() !== userId.toString());
    await post.save();

    // Also remove the post from the user's savedPosts array
    const user = await User.findById(userId);
    user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId.toString());
    await user.save();

    res.status(200).json({ message: "Post unsaved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
  sharePost,
  savePost,
  unsavePost,
};
