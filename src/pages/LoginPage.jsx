import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { UserCircle, Lock, Eye, EyeOff } from "lucide-react";
import { API, notify } from "../utils/common";
import { ToastContainer } from "react-toastify";
import { addUser } from "../indexedDB";
import { Link } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [isFetching, setIsFetching] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFetching(true);
    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
          // remember_me: remember_me,
        }),
      });

      const data = await response.json();
      if (data.status === true) {
        setIsFetching(false);
        notify(`Welcome ${data.user.name}`, "success");

        await addUser({ id: "user", ...data.user });
        if (data.user.role === "Employee") {
          setTimeout(() => navigate("/attendance"), 2000);
        } else {
          setTimeout(() => navigate("/dashboard"), 2000);
        }
      } else {
        setIsFetching(false);
        notify(data.message, "error");
      }
    } catch (error) {
      setIsFetching(false);
      notify("Something went wrong", "success");
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setIsFetching(true);
    try {
      // 1. Extract Google ID Token
      const googleIdToken = credentialResponse.credential;

      // 2. Send ID token to Laravel backend to authenticate
      const res = await axios.post(`${API}/auth/google-login`, {
        token: googleIdToken,
      });

      const { user } = res.data;

      // 3. Store backend token & user
      await addUser({ id: "user", ...user });
      setIsFetching(false);
      notify(`Welcome ${user.name}`, "success");
      if (user.role === "Employee") {
        setTimeout(() => navigate("/attendance"), 2000);
      } else {
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (error) {
      setIsFetching(false);
      notify("Google login failed. Try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row max-w-5xl w-full">
        {/* Left Section - Brand */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 md:w-5/12 p-10 flex flex-col justify-between text-white">
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Employee Management System
            </h2>
            {/* <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Streamline your workforce management with our comprehensive
              solution.
            </p>

            <div className="hidden md:block space-y-6 mt-16">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 bg-opacity-30 p-2 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Streamlined Management</h3>
                  <p className="text-blue-200 text-sm">
                    Handle employee data with ease and efficiency
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 bg-opacity-30 p-2 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Performance Analytics</h3>
                  <p className="text-blue-200 text-sm">
                    Track metrics and drive productivity
                  </p>
                </div>
              </div>
            </div> */}
          </div>

          {/* <div className="hidden md:block">
            <div className="bg-blue-500 bg-opacity-30 p-6 rounded-xl">
              <p className="italic text-sm mb-3">
                "This system has transformed how we manage our team and
                streamlined our entire HR workflow."
              </p>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-200 rounded-full mr-2"></div>
                <div>
                  <p className="font-semibold text-sm">Sarah Johnson</p>
                  <p className="text-xs text-blue-200">HR Director, TechCorp</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Right Section - Login Form */}
        <div className="md:w-7/12 p-6 md:p-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600 mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          {notification.message && (
            <div className="mb-6">
              <Notification
                type={notification.type}
                message={notification.message}
              />
            </div>
          )}

          {/* Google Sign-in Button */}
          <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.log("Login Failed");
                setNotification({
                  type: "error",
                  message: "Google login failed. Try again.",
                });
              }}
              shape="rectangular"
              size="large"
              width="100%"
              text="signin_with"
              theme="outline"
            />
          </div>

          {/* OR Separator */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 block w-full rounded-lg border border-gray-300 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 block w-full rounded-lg border border-gray-300 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              {isFetching ? (
                <button
                  type="button"
                  disabled
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-400 cursor-not-allowed"
                >
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Sign in
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 text-center text-sm"></div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
