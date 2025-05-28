import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { API, notify } from "../utils/common";
import { getUser } from "../indexedDB";
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    presentEmployees: 0,
    leaveEmployees: 0,
    pendingTasks: 0,
    completedToday: 0,
  });

  const [animationComplete, setAnimationComplete] = useState(false);

  //user
  const [monthSummary, setMonthSummary] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [lastLeaveRequest, setLastLeaveRequest] = useState([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    let get = await getUser("user");
    setUser(get);
    if (get.role === "Admin") {
      fetchDashboardData(get.access_token);
    } else if (get.role === "Employee") {
      const data = await fetchDashboardDataUser(get.access_token);
      // setHolidays(data);
    }
  };

  const fetchDashboardData = async (token) => {
    try {
      const response = await axios.get(`${API}/dashboard-summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (response.data.status) {
        setData(response.data);
      } else {
        notify(response.data.message || "Failed to fetch data", "error");
      }
    } catch (error) {
      console.error("Failed to fetch Employee count:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardDataUser = async (token) => {
    try {
      const response = await axios.get(`${API}/dashboard-summary-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (response.data.status) {
        setMonthSummary(response.data.data.monthSummary);
        setHolidays(response.data.data.holidays.holidays);
        setLastLeaveRequest(response.data.data.latestLeave);
      } else {
        notify(response.data.message || "Failed to load data", "error");
      }
    } catch (error) {
      console.error("Failed to fetch Employee count:", error);
    } finally {
      setLoading(false);
    }
  };
  console.log(holidays);
  const setData = (data) => {
    const targetData = {
      totalEmployees: data.totalEmployees,
      presentEmployees: data.presentEmployees,
      leaveEmployees: data.leaveEmployees,
      pendingTasks: data.pendingTasks,
      workingTasks: data.workingTasks,
      completedToday: data.completedToday,
    };

    const animateNumbers = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setSummary({
          totalEmployees: Math.round(targetData.totalEmployees * easeOut),
          presentEmployees: Math.round(targetData.presentEmployees * easeOut),
          leaveEmployees: Math.round(targetData.leaveEmployees * easeOut),
          pendingTasks: Math.round(targetData.pendingTasks * easeOut),
          workingTasks: Math.round(targetData.workingTasks * easeOut),
          completedToday: Math.round(targetData.completedToday * easeOut),
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimationComplete(true);
        }
      }, stepDuration);
    };

    const timer = setTimeout(animateNumbers, 500);
    return () => clearTimeout(timer);
  };

  const cards = [
    {
      title: "Total Employees",
      value: summary.totalEmployees,
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      textColor: "text-blue-800",
      hoverBg: "hover:bg-blue-100",
      shadowColor: "shadow-blue-100",
      description: "Active workforce",
    },
    {
      title: "Present Today",
      value: summary.presentEmployees,
      icon: UserCheck,
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      textColor: "text-green-800",
      hoverBg: "hover:bg-green-100",
      shadowColor: "shadow-green-100",
      description: "Currently working",
    },
    {
      title: "On Leave",
      value: summary.leaveEmployees,
      icon: Calendar,
      color: "yellow",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-600",
      textColor: "text-yellow-800",
      hoverBg: "hover:bg-yellow-100",
      shadowColor: "shadow-yellow-100",
      description: "Approved absences",
    },
    {
      title: "Pending Tasks",
      value: summary.pendingTasks,
      icon: Clock,
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      iconColor: "text-purple-600",
      textColor: "text-purple-800",
      hoverBg: "hover:bg-purple-100",
      shadowColor: "shadow-purple-100",
      description: "Awaiting assignment",
    },
    {
      title: "In Process Tasks",
      value: summary.workingTasks,
      icon: Activity,
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-600",
      textColor: "text-orange-800",
      hoverBg: "hover:bg-orange-100",
      shadowColor: "shadow-orange-100",
      description: "In progress",
    },
    {
      title: "Completed Today",
      value: summary.completedToday,
      icon: CheckCircle,
      color: "teal",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      iconColor: "text-teal-600",
      textColor: "text-teal-800",
      hoverBg: "hover:bg-teal-100",
      shadowColor: "shadow-teal-100",
      description: "Tasks finished",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ToastContainer />
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {user.role === "Admin" && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon;
              const percentage =
                card.title === "Present Today"
                  ? Math.round(
                      (summary.presentEmployees / summary.totalEmployees) * 100
                    )
                  : null;
              return (
                <div
                  key={card.title}
                  className={`${card.bgColor} ${card.borderColor} ${card.hoverBg} border-2 rounded-2xl p-6 shadow-lg ${card.shadowColor} transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative overflow-hidden`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: "fadeInUp 0.6s ease-out forwards",
                  }}
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 opacity-10 transform rotate-12 translate-x-4 -translate-y-4">
                    <Icon size={80} className={card.iconColor} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-2 rounded-lg ${card.bgColor} border ${card.borderColor} group-hover:scale-110 transition-transform duration-200`}
                      >
                        <Icon className={`${card.iconColor} w-5 h-5`} />
                      </div>
                      {percentage && (
                        <div
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${card.bgColor} ${card.textColor} border ${card.borderColor}`}
                        >
                          {percentage}%
                        </div>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-semibold ${card.textColor} mb-2 leading-tight`}
                    >
                      {card.title}
                    </h3>

                    <div className="flex items-end justify-between">
                      <p
                        className={`text-3xl font-bold ${card.textColor} transition-all duration-300 group-hover:scale-110`}
                      >
                        {card.value}
                        {animationComplete && (
                          <span className="inline-block ml-1 animate-pulse">
                            <TrendingUp className="w-4 h-4 inline" />
                          </span>
                        )}
                      </p>
                    </div>

                    <p className="text-xs text-gray-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {card.description}
                    </p>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {user.role === "Employee" && (
        <div className="max-w-5xl mx-auto grid gap-6 py-6">
          {/* This Month's Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-md rounded-2xl p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
              📊 This Month's Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-blue-900">
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-sm font-medium">Total Working Days</p>
                <p className="text-xl font-bold">{monthSummary.total_days}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-sm font-medium">Days Present</p>
                <p className="text-xl font-bold">{monthSummary.present}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-sm font-medium">Leaves Taken</p>
                <p className="text-xl font-bold">{monthSummary.leaves}</p>
              </div>
            </div>
          </div>

          {/* Upcoming Holidays */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 shadow-md rounded-2xl p-6">
            <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
              🎉 Upcoming Holidays
            </h2>
            {holidays.length > 0 ? (
              <ul className="list-disc ml-5 text-green-900 space-y-2">
                {holidays.map((holiday) => (
                  <li key={holiday.id}>
                    <span className="font-medium">{holiday.name}</span> 
                    <span className="text-sm">
                      {new Date(holiday.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                      })}{" "}
                      - {holiday.title}
                    </span>{" "}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-700">No upcoming holidays</p>
            )}
          </div>

          {/* Last Leave Request */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-md rounded-2xl p-6">
            <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
              📝 Last Leave Request
            </h2>
            {lastLeaveRequest ? (
              <div className="text-yellow-900 space-y-1">
                <p>
                  <strong>From:</strong>{" "}
                  {new Date(lastLeaveRequest.start_date).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                  &nbsp;&nbsp;&nbsp;
                  <strong>To:</strong>{" "}
                  {new Date(lastLeaveRequest.end_date).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`ml-1 font-semibold ${
                      lastLeaveRequest.status === "approved"
                        ? "text-green-600"
                        : lastLeaveRequest.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {lastLeaveRequest.status}
                  </span>
                </p>
                <p>
                  <strong>Reason:</strong> {lastLeaveRequest.reason}
                </p>
              </div>
            ) : (
              <p className="text-yellow-700">No leave request found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default DashboardPage;
