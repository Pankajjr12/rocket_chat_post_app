import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import { getRecipientSocketId, io } from "../socket/socket.js";

const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { image, images, video } = req.body;

    // Validation: required fields
    if (!postedBy || !text) {
      return res.status(400).json({ error: "Post text and postedBy are required." });
    }

    // Validate user
    const user = await User.findById(postedBy);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post." });
    }

    // Validate text length
    const maxLength = 500;
    if (text.length > maxLength) {
      return res.status(400).json({ error: `Text must be less than ${maxLength} characters.` });
    }

    // Normalize single image into images array
    if (image && !images) images = [image];

    // Validate max 4 images
    if (images && images.length > 4) {
      return res.status(400).json({ error: "Maximum 4 images allowed." });
    }

    // Upload images to Cloudinary
    let uploadedImages = [];
    if (images && images.length > 0) {
      for (let img of images) {
        try {
          const uploaded = await cloudinary.uploader.upload(img, { resource_type: "image" });
          uploadedImages.push(uploaded.secure_url);
        } catch (err) {
          console.error("Image upload error:", err);
          return res.status(500).json({ error: "Failed to upload images." });
        }
      }
    }

    // Upload video to Cloudinary
    let uploadedVideoUrl = null;
    if (video) {
      try {
        const uploadedVideo = await cloudinary.uploader.upload(video, { resource_type: "video" });
        uploadedVideoUrl = uploadedVideo.secure_url;
      } catch (err) {
        console.error("Video upload error:", err);
        return res.status(500).json({ error: "Failed to upload video." });
      }
    }

    // Create post with all uploaded media
    const newPost = new Post({
      postedBy,
      text,
      images: uploadedImages,
      video: uploadedVideoUrl,
    });

    await newPost.save();

    res.status(201).json({ message: "Post created successfully", newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const post = await Post.findById(postId).populate("postedBy", "username");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // anyone should be able to share → remove the "Unauthorized" check
    // if you want to keep it, fine, but usually sharing is allowed by all

    const message = {
      sender: req.user._id,
      recipient: recipientId,
      content: `@${req.user.username} shared a post`,
      type: "post_share",
      postId,
      link: `/post/${postId}`,   // ✅ add post link
    };

    // emit socket event
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", message);
    }

    // also return it to frontend
    res.status(200).json({ 
      message: "Post shared successfully",
      sharedMessage: message 
    });
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
