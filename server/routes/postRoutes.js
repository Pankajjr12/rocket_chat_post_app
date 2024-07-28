import express from 'express';
import { createPost,getPost,deletePost,likeUnlikePost, replyToPost,getFeedPosts,getUserPosts, sharePost, savePost, unsavePost} from '../controllers/postController.js';
import protectRoute from '../middlewares/protectRoute.js'

const router = express.Router();

router.get("/feed", protectRoute, getFeedPosts);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);

router.put("/like/:id", protectRoute, likeUnlikePost);

router.put("/reply/:id", protectRoute, replyToPost);
router.post("/share", protectRoute, sharePost);

router.post("/save/:id", protectRoute, savePost); // Route to save a post
router.post("/unsave/:id", protectRoute, unsavePost); // Route to unsave a post

export default router;