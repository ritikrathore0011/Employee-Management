import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [isFetching, setIsFetching] = useState(false);
  const handleSubmit = async (e) => {
    setIsFetching(true);

    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();
      if (data.status === true) {
        //setNotification(`Welcome ${data.user.name}`);
        setIsFetching(false);

        setNotification({
          type: "success",
          message: `Welcome ${data.user.name}`,
        });
        localStorage.setItem("user", JSON.stringify(data.user));
        // navigate('/dashboard');
        setTimeout(() => navigate("/dashboard"), 2000); // Optional: delay to show the notification
      } else {
        setIsFetching(false);

        // setNotification(data.message || 'Login failed');
        setNotification({
          type: "error",
          message: data.message || "Login failed",
        });
      }
    } catch (error) {
      setIsFetching(false);

      console.error("Login error:", error);
      //setNotification('Something went wrong. Please try again.');
      setNotification({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const handleLogin = async (credentialResponse) => {
    setIsFetching(true);
    try {
      // 1. Extract Google ID Token
      const googleIdToken = credentialResponse.credential;
  
      // 2. Send ID token to Laravel backend to authenticate
      const res = await axios.post("http://localhost:8000/api/auth/google-login", {
        token: googleIdToken,
      });
  
      const { user, access_token } = res.data;
  
      // 3. Store backend token & user
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", access_token);
  
      // 4. Request Google Access Token for Google APIs
     // await requestGoogleAccessToken();
  
      setIsFetching(false);
      setNotification({
        type: "success",
        message: `Welcome ${user.name}`,
      });
  
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setIsFetching(false);
      console.error("Google login error:", error);
      setNotification({
        type: "error",
        message: "Google login failed. Try again.",
      });
    }
  };
 
//console.log(googleAccessToken);
// const token = localStorage.getItem("googleAccessToken");
// console.log("Token after function ends:", token);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>

        {/* ✅ Show notification here */}
        {notification.message && (
          <Notification
            type={notification.type}
            message={notification.message}
          />
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="text"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {isFetching ? (
            <div className="w-full bg-gray-100 text-indigo-600 font-semibold py-2 px-4 rounded-lg text-center shadow-sm">
              🔄 Fetching details, please wait...
            </div>
          ) : (
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Login
            </button>
          )}
        </form>
        <div className="mt-4">
          <div className="w-full  ">
            <GoogleLogin
              onSuccess={handleLogin}
              onError={() => {
                console.log("Login Failed");
              }}
            />
          </div>
        </div>
      </div>

      {/* for google login */}
      {/* <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-6 rounded shadow-md"> */}
      {/* <h2 className="text-xl font-semibold mb-4 text-center">Login with Google</h2>
        <GoogleLogin
          onSuccess={handleLogin}
          onError={() => {
            console.log('Login Failed');
          }}
        /> */}
    </div>
    // </div>
    // </div>
  );
}

export default LoginPage;
