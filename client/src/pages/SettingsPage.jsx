import { Button, Text } from "@chakra-ui/react";
import React from "react";

const SettingsPage = () => {
  const freezeAccount = async () => {
    if (!window.confirm("Are you sure you want to freeze your account? 🔑"))
      return;

    try {
      const res = await fetch("/api/users/freeze", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.error) {
        return showToast("Error", data.error, "error");
      }
      if (data.success) {
        await logout();
        showToast("Success", "Your account has been frozen 🙄", "success");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };
  return (
    <>
      <Text my={1} fontWeight={"bold"}>
        Freeze Your Account
      </Text>
      <Text my={2}>Unfreeze your account anytime by logging in 👍.</Text>
      <Button size={"sm"} colorScheme="green" onClick={freezeAccount}>
        Freeze
      </Button>
    </>
  );
};

export default SettingsPage;
