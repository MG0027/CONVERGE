import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { LoginForm } from "../components/ui/login-form";
import { signIn } from "@/store/authSlice";
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError(null);

        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const res = await axios.post("https://convergeb.onrender.com/api/auth", {
          email: userInfo.data.email,
          name: userInfo.data.name,
          picture: userInfo.data.picture,
        });

        dispatch(signIn(res.data.user));
         localStorage.setItem("token", res.data.token);
        navigate("/");
      } catch (err) {
        setError("Login failed. Please try again.");
        console.error("Login failed", err);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      setError("Google login failed.");
      console.error("Login Error:", error);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            CONVERGE
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access your customer data and campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={googleLogin}
          >
            <FcGoogle className="h-5 w-5" />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-gray-500 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
    // <>
    // <LoginForm></LoginForm>
    // </>
  );
}

export default Login;
