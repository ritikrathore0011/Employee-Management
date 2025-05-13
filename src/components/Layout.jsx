import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearUserStore, getUser } from "../indexedDB";
import { API } from "../utils/common";
import axios from "axios";

function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [pendingCount, setPendingCount] = useState(0);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const init = async () => {
    let get = await getUser("user");
    setUser(get);
    fetchPendingCount(get.access_token);
  };

  console.log(user);

  const handleLogout = async () => {
    console.log("logout");
    await clearUserStore();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  useEffect(() => {
    init();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchPendingCount = async (token) => {
    try {
      const response = await axios.get(`${API}/pending-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setPendingCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch pending leave count:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`bg-indigo-500 text-white transition-all duration-300 ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <button onClick={toggleSidebar} className="p-4 focus:outline-none">
          {isOpen ? "◀" : "▶"}
        </button>
        <nav className="mt-4 space-y-2">
          <Link
            to="/dashboard"
            className={`block px-4 py-2 hover:bg-gray-700 ${
              isActive("/dashboard") ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            Dashboard
          </Link>
          {/* <Link
            to="/records"
            className={`block px-4 py-2 hover:bg-gray-700 ${
              isActive("/records") ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            Records
          </Link> */}
          {user.role === "Admin" && (
            <Link
              to="/employees"
              className={`block px-4 py-2 hover:bg-gray-700 ${
                isActive("/employee") ? "bg-gray-700 font-semibold" : ""
              }`}
            >
              Employees
            </Link>
          )}
          {user.role != "Admin" && (
            <Link
              to="/attendance"
              className={`block px-4 py-2 hover:bg-gray-700 ${
                isActive("/attendance") ? "bg-gray-700 font-semibold" : ""
              }`}
            >
              Attendance
            </Link>
          )}
          {/* <Link
            to="/leave-holidays"
            className={`block px-4 py-2 hover:bg-gray-700 ${
              isActive("/leave-holidays") ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            Leave & Holidays
          </Link> */}
          <div className="relative inline-block">
            <Link
              to="/leave-holidays"
              className={`block px-4 py-2 hover:bg-gray-700 ${
                isActive("/leave-holidays") ? "bg-gray-700 font-semibold" : ""
              }`}
            >
              Leave & Holidays
            </Link>
            {user.role === "Admin" && pendingCount > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>
          <Link
            to="/profile"
            className={`block px-4 py-2 hover:bg-gray-700 ${
              isActive("/profile") ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            Profile
          </Link>
          {/* <Link
            to="/events"
            className={`block px-4 py-2 hover:bg-gray-700 ${
              isActive("/events") ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            Events
          </Link>
          <Link
            to="/payroll"
            className={`block px-4 py-2 hover:bg-gray-700 ${
              isActive("/payroll") ? "bg-gray-700 font-semibold" : ""
            }`}
          >
            Payroll
          </Link> */}
        </nav>
      </div>

      {/* Main Content with Header */}
      <div className="flex-1 bg-gray-100">
        {/* Header */}
        <div className="relative flex justify-end items-center p-4 bg-white shadow">
          <div className="relative" ref={dropdownRef}>
            {/* {user?.profile ? (
              <img
                src={user.profile}
                alt={user.initials ?? "Profile"}
                className="w-10 h-10 rounded-full object-cover cursor-pointer shadow-md"
                onClick={() => setShowProfile(!showProfile)}
              />
            ) : ( */}
              <div
                className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold cursor-pointer shadow-md"
                onClick={() => setShowProfile(!showProfile)}
              >
                {user?.initials}
              </div>
            {/* )} */}

            {showProfile && (
              <div className="absolute right-0 mt-2 bg-white border rounded-xl shadow-lg p-4 w-48 z-50">
                <p className="text-gray-800 font-semibold mb-2">{user?.name}</p>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
