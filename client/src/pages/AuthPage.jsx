import React from "react";

import LoginCard from "../components/LoginCard";
import { useRecoilValue } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import RegisterCard from "../components/RegisterCard";

const AuthPage = () => {
	const authScreenState = useRecoilValue(authScreenAtom);

	return <>{authScreenState === "login" ? <LoginCard /> : <RegisterCard />}</>;
};

export default AuthPage;
