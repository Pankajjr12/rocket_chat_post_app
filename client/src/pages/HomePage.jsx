import { Button, Flex, Spinner, Box, Divider } from "@chakra-ui/react";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postAtom";
import messageSound from '../assets/notirocket.mp3';
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
      } else {
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
        }
      }
      setLoading(false);
    };

    if (!soundPlayedRef.current) {
      const sound = new Audio(messageSound);
      sound.play();
      soundPlayedRef.current = true; // Prevent replay
    }

    getFeedPosts();
  }, []);

  const renderedPosts = useMemo(() => (
    posts.map((post) => (
      <Post key={post._id} post={post} postedBy={post.postedBy} />
    ))
  ), [posts]);

  return (
    <>
      <Divider my={4} />
      <MobileSuggestedUsers />
      <Flex gap={"10"} alignItems={"flex-start"}>
        <Box flex={70}>
          {loading ? (
            <Flex justify="center">
              <Spinner size="xl" />
            </Flex>
          ) : (
            <>
              {!posts.length ? (
                <h1>Follow some users to see the posts</h1>
              ) : (
                renderedPosts
              )}
            </>
          )}
        </Box>
        <Box flex={30} display={{ base: "none", md: "block" }}>
          <SuggestedUsers />
        </Box>
      </Flex>
    </>
  );
};

export default HomePage;
