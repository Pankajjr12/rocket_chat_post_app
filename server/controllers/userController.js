import generateTokenAndSetCookie from "../auth/generateTokenAndSetCookie.js";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Conversation from "../models/conversationModel.js";

const getUserProfile = async (req, res) => {
  // We will fetch user profile either with username or userId
  // query is either username or userId
  const { query } = req.params;

  try {
    let user;

    // query is userId
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      // query is username
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserProfile: ", err.message);
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashPassword,
    });
    await newUser.save();

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in registration", error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username: username }, { email: username }],
    });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: "Invalid credentials" });
    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }


    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in loginUser: ", error.message);
  }
};

const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in signupUser: ", err.message);
  }
};

const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in followUnFollowUser: ", err.message);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not registered, please check email" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PWD,
      },
    });
    const encodedToken = encodeURIComponent(token).replace(/\./g, "%2E");

    var mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Reset Password Rocket Chat App",
      text: `https://chat-rocket-webapp-kumar-studio.onrender.com/resetPassword/${encodedToken}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.json({ message: "error sending mail" });
      } else {
        return res.json({ status: true, message: "email sent" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in forgot password", error.message);
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;
    const hashPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(id, { password: hashPassword });
    return res.json({ status: true, message: "Password updated successfully" });
  } catch (error) {
    return res.json({ status: false, message: "Invalid or expired token" });
  }
};

const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found." });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      user.password = hashPassword;
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    await user.save();

    // Find all posts that this user replied and update username and userProfilePic fields
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    user.password = null;
    res.status(200).json({ message: "Profile upated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in updateUser", error.message);
  }
};

const getSuggestedUsers = async (req,res) => {
  try {
		// exclude the current user from suggested users array and exclude users that current user is already following
		const userId = req.user._id;

		const usersFollowedByYou = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{
				$sample: { size: 10 },
			},
		]);
		const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 10);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get users followed by the authenticated user
    const usersFollowedByYou = await User.findById(userId).select("following");
    const followedUserIds = new Set(usersFollowedByYou.following.map(user => user.toString()));

    // Get recently chatted users
    const recentConversations = await Conversation.find({
      participants: userId
    }).sort({ updatedAt: -1 }).limit(10);

    const recentlyChattedUserIds = recentConversations.map(conversation => {
      return conversation.participants.find(participant => participant.toString() !== userId.toString());
    });

    // Get other users (exclude current user)
    const otherUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }
        }
      },
      { $sample: { size: 10 } } // Sample 10 users
    ]);

    // Concatenate user IDs ensuring uniqueness and order by priority (followed, recently chatted, others)
    let suggestedUserIds = [
      ...followedUserIds,
      ...recentlyChattedUserIds,
      ...otherUsers.map(user => user._id.toString())
    ];

    suggestedUserIds = Array.from(new Set(suggestedUserIds)); // Ensure uniqueness

    // Fetch suggested users based on the concatenated IDs
    const suggestedUsers = await User.find({ _id: { $in: suggestedUserIds } });

    // Ensure the order of suggestedUsers matches the order of suggestedUserIds
    suggestedUsers.sort((userA, userB) => {
      const indexA = suggestedUserIds.indexOf(userA._id.toString());
      const indexB = suggestedUserIds.indexOf(userB._id.toString());
      return indexA - indexB;
    });

    // Remove sensitive information (e.g., password) before sending the response
    suggestedUsers.forEach(user => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


const freezeAccount = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		user.isFrozen = true;
		await user.save();

		res.status(200).json({ success: true });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Retrieve saved posts
    const user = await User.findById(userId).populate("savedPosts").sort({ updatedAt: -1 })
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.savedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error fetching saved posts: ", error.message);
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  getSuggestedUsers,
  getUsers,
  freezeAccount,
  getSavedPosts,
};
