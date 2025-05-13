// import { useState } from "react";
// import axios from "axios";
// import { API, notify } from "../utils/common";
// import { ToastContainer } from "react-toastify";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const[fetch, setFetch] =  useState(false);
//   const[show, setShow] = useState(false);

//   const handleSendOTP = async (e) => {
//     e.preventDefault();
//     setFetch(true);
//     setError("");
//     setMessage("");

//     if (!email) {
//       setError("Email is required.");
//       return;
//     }

//     try {
//       const response = await axios.post(`${API}/forgot-password`, { email }); // update endpoint as needed
//       setMessage(response.data.message || "OTP sent to your email.");
//       notify(response.data.message || "OTP sent to your email.","success");
//       setShow(true);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to send OTP.");
//       notify(err.response?.data?.message || "Failed to send OTP.","error");
//     }finally{
//       setFetch(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
//       <ToastContainer />
//       <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
//         <h1 className="text-xl font-bold mb-4 text-center">Forgot Password</h1>
//         <form onSubmit={handleSendOTP}>
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded mb-4"
//           />

//           <button
//             onClick={handleSendOTP}
//             className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
//             disabled ={fetch}
//           >
//             {fetch ? "Sending" : "Send OTP"}
//           </button>
//         </form>
//         {message && (
//           <p className="text-green-600 mt-4 text-center">{message}</p>
//         )}
//         {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { API, notify } from "../utils/common";

const ForgotPasswordWithOTP = () => {
  const [step, setStep] = useState(1); // Step 1: send OTP, Step 2: verify + reset
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fetch, setFetch] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    console.log("hy");
    const item = localStorage.getItem("step");
    if (item) {
      setStep(2);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setFetch(true);
    try {
      const res = await axios.post(`${API}/send-otp`, { email });
      if (res.data.success) {
        setMessage(res.data.message);
        notify(res.data.message, "success");
        setStep(2);
        localStorage.setItem("step", 2);
      } else {
        setError(res.data.message);
        notify(res.data.message, "error");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
      notify(err.response?.data?.message, "error");
    } finally {
      setFetch(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFetch(true);
    try {
      const res = await axios.post(`${API}/reset-password`, {
        email,
        otp,
        password,
        password_confirmation: confirmPassword,
      });

      if (res.data.success) {
        setMessage(res.data.message);
        notify(res.data.message, "success");
        localStorage.removeItem("step");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setError(res.data.message);
        notify(res.data.message, "error");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
      notify(err.response?.data?.message, "error");
    } finally {
      setFetch(false);
    }
  };

  const handleResendOTP = () => {
    localStorage.removeItem("step");
    setStep(1);
    setError("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <ToastContainer />
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">
          {step === 1 ? "Forgot Password" : "Enter OTP & New Password"}
        </h1>

        <form onSubmit={step === 1 ? handleSendOTP : handleResetPassword}>
          {step === 1 && (
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded mb-4"
              required
            />
          )}
          {step === 2 && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOTP(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded mb-4"
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded mb-4"
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded mb-4"
                required
              />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            disabled={fetch}
          >
            {fetch
              ? "Processing..."
              : step === 1
              ? "Send OTP"
              : "Reset Password"}
          </button>
        </form>
        {step === 2 && (
            <button type="button" onClick={handleResendOTP}>
              Resend otp
            </button>
          )}

        {message && (
          <p className="text-green-600 mt-4 text-center">{message}</p>
        )}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPasswordWithOTP;
