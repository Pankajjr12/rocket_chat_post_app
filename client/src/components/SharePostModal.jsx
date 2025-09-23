import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, List, Avatar } from "antd";
import useShowToast from "../hooks/useShowToast";
import { useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import selectedConversationAtom from "../atoms/selectedConversationAtom;";

const SharePostModal = ({ isOpen, onClose, post }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const showToast = useShowToast();
  const navigate = useNavigate();
  const setSelectedConversation = useSetRecoilState(selectedConversationAtom);

  const postId = post?._id;

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

    if (isOpen) fetchSuggestedUsers();
  }, [isOpen, showToast]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredUsers = searchTerm
    ? users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  const handleShare = async (user) => {
    try {
      const token = localStorage.getItem("user-rockets");
      const res = await fetch("/api/posts/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId, recipientId: user._id }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Success", `Shared with ${user.username}`, "success");

        // Update conversation state
        setSelectedConversation({
          _id: user._id,
          userId: user._id,
          userProfilePic: user.profilePic,
          username: user.username,
        });

        navigate("/chat");
      } else {
        showToast("Error", data.error || "Failed to share post", "error");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      onClose();
    }
  };

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
      maskClosable={false}
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
                  avatar={<Avatar src={user.profilePic} />}
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
