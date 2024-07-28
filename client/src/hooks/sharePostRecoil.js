import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postAtom";

export const useSharePost = () => {
    const [posts, setPosts] = useRecoilState(postsAtom);
  
    const sharePostWithUser = async (postId, recipientId) => {
      try {
        const res = await fetch('/api/posts/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId, recipientId }),
        });
        const data = await res.json();
        if (res.ok) {
          // Update local state (assuming posts is an array of objects with postId)
          const updatedPosts = posts.map((post) =>
            post.id === postId
              ? { ...post, sharedWith: [...post.sharedWith, recipientId] }
              : post
          );
          setPosts(updatedPosts);
        } else {
          console.error('Failed to share post:', data.error);
        }
      } catch (error) {
        console.error('Failed to share post:', error.message);
      }
    };
  
    return sharePostWithUser;
  };