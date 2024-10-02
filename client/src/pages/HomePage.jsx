import { Button, Flex, Spinner, Box, Divider } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postAtom";
import messageSound from '../assets/notirocket.mp3'
import Post from "../components/Post";
import SuggestedUsers from "../components/SuggestedUsers";
import MobileSuggestedUsers from "../components/MobileSuggestedUsers";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();
  const soundPlayedRef = useRef(false);
  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      const cachedPosts = localStorage.getItem('feedPosts');
      if (cachedPosts) {
        setPosts(JSON.parse(cachedPosts));
        setLoading(false);
        return;
      }
  
      try {
        const res = await fetch("/api/posts/feed");
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setPosts(data);
        localStorage.setItem('feedPosts', JSON.stringify(data));
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    if (!soundPlayedRef.current) {
      const sound = new Audio(messageSound);
      sound.play();
      soundPlayedRef.current = true; // Set to true to prevent playing again
    }
  
    getFeedPosts();
  }, [showToast, setPosts]);
  


  return (
    <>
      <Divider my={4} />

      <MobileSuggestedUsers/>
      <Flex gap={"10"} alignItems={"flex-start"}>
        <Box flex={70}>
          {!loading && posts.length === 0 && (
            <h1>Follow some users to see the posts</h1>
          )}

          {loading && (
            <Flex justify="center">
              <Spinner size="xl" />
            </Flex>
          )}
          {Array.isArray(posts) ? (
            posts.map((post) => (
              <Post key={post._id} post={post} postedBy={post.postedBy} />
            ))
          ) : (
            <p>No posts available</p>
          )}
        </Box>
        <Box
          flex={30}
          display={{
            base: "none",
            md: "block",
          }}
        >
          <SuggestedUsers />
        </Box>
      </Flex>
    </>
  );
};

export default HomePage;
