import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, List, Avatar } from "antd";
import useShowToast from "../hooks/useShowToast";
import { useColorModeValue } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import postsAtom from "../atoms/postAtom";

const SharePostModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const showToast = useShowToast();

  const posts = useRecoilValue(postsAtom); // Access Recoil state

  // Assuming posts is an array and you want to get a specific post ID
  const postId = posts.length > 0 ? posts[0]._id : null; // Replace with logic to get the
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users/get-users");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUsers(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, [showToast]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = searchTerm
    ? users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  const handleShare = async (user) => {
    try {
      // Replace with the actual post ID
      const response = await fetch("/api/posts/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user-rockets")}`, // Assuming you're using JWT
        },
        body: JSON.stringify({ postId, recipientId: user._id }),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        showToast(
          "Success",
          `Check! Your share post with ${user.name}`,
          "success"
        );
      } else {
        showToast("Error", data.error || "Failed to share post", "error");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      onClose(); // Close the modal
    }
  };

  // Using useColorModeValue to dynamically set background color
  const bgColor = useColorModeValue("white", "gray.800");
  return (
    <Modal
      title="Share Post"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Close
        </Button>,
      ]}
      maskClosable={false} // Prevent closing on mask click
      style={{ borderRadius: "20px 20px 0 0", backgroundColor: bgColor }}
    >
      <Form layout="vertical" onFinish={onClose} style={{ margin: 0 }}>
        <Form.Item label="Search users" name="search">
          <Input onChange={handleSearch} placeholder="Search users" />
        </Form.Item>
        <div className="scrollable-container">
          <List
            dataSource={filteredUsers}
            loading={loading}
            renderItem={(user) => (
              <List.Item
                key={user._id}
                actions={[
                  <Button
                    key="share"
                    type="primary"
                    onClick={() => handleShare(user)}
                  >
                    Share
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar src={user.profilePic} className="black-border" />
                  }
                  title={<a href={`/${user.username}`}>{user.username}</a>}
                />
              </List.Item>
            )}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default SharePostModal;
