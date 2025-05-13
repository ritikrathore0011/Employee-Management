import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import CustomConfirmModal from "../components/CustomConfirmModal";
import axios from "axios";
import { API, notify ,fetchHolidays } from "../utils/common";
import { addUser, getUser } from "../indexedDB";

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    let get = await getUser("user");
    setUser(get);
    fetchEmployeeCount(get.access_token);
    const data = await fetchHolidays();
    setHolidays(data);
  };

  const fetchEmployeeCount = async (token) => {
    try {
      const response = await axios.get(`${API}/employees-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setUserCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch Employee count:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ToastContainer />
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6 relative">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard Page</h1>
      <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Total Employees
        </h2>
        <p className="text-3xl font-bold text-blue-600">{userCount}</p>
      </div>

      <div className="bg-yellow-50 p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">Upcoming Holidays</h3>
        <ul className="text-sm space-y-1">
          {holidays?.length ? (
            holidays.map((holiday) => (
              <li key={holiday.id}>
                {new Date(holiday.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
                {"-"} {holiday.title}
              </li>
            ))
          ) : (
            <li>No holidays added</li>
          )}
        </ul>
      </div>
    </div>
  );
}
export default DashboardPage;
