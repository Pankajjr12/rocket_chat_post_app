import React, { useMemo } from "react";

import LoginCard from "../components/LoginCard";
import { useRecoilValue } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import RegisterCard from "../components/RegisterCard";

const AuthPage = () => {
  const authScreenState = useRecoilValue(authScreenAtom);

  // Memoize the component rendering based on authScreenState
  const renderedCard = useMemo(() => {
    return authScreenState === "login" ? <LoginCard /> : <RegisterCard />;
  }, [authScreenState]); // Only re-render when authScreenState changes

  return <>{renderedCard}</>;
};

export default AuthPage;
