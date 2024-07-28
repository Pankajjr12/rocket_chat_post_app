import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  getSuggestedUsers,
  freezeAccount,
  getUsers,
  getSavedPosts,
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.get("/get-users", protectRoute, getUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/follow/:id", protectRoute, followUnfollowUser);
router.put("/update/:id", protectRoute, updateUser);
router.get("/saved-posts", protectRoute, getSavedPosts);
router.put("/freeze", protectRoute, freezeAccount);

export default router;
