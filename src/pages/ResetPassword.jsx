import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { notify ,API } from "../utils/common";
import { ToastContainer } from "react-toastify";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fetch , setFetch] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setFetch(true);
    try {
      const res = await axios.post(`${API}/reset-password`,
        {
          token,
          password,
          password_confirmation: passwordConfirmation,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      if (res.data.success) {
        setMessage(res.data.message);
        notify(res.data.message, "success");
        // Redirect after short delay
        setTimeout(() => {
          window.location.href = res.data.redirect || "/login";
        }, 1500);
      } else {
        notify(res.data.message, "error");
        setError(res.data.message || "Reset failed");
        notify(res.data.message || "Reset failed", "error");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
      notify(err.response?.data?.message, "error");
    }finally{
      setFetch(false);
    }

  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      <ToastContainer />
      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="block w-full border p-2 mb-4"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
          className="block w-full border p-2 mb-4"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={fetch}
        >
         { fetch ? "Resetting" : "Reset Password" }   
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
