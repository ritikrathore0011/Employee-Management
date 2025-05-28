import { useState, useEffect, useRef } from "react";
import {
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { getUser } from "../indexedDB";
import { API, notify, useOutsideClick } from "../utils/common";
import axios from "axios";
import { ToastContainer } from "react-toastify";

export default function EmployeeDashboard() {
  const [user, setUser] = useState({});
  const [token, setToken] = useState("");
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  ); // yyyy-mm-dd
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  // Status styling configuration
  const statusColors = {
    pending: "bg-red-100 text-red-800 border-l-4 border-red-400",
    started: "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-400",
    completed: "bg-green-100 text-green-800 border-l-4 border-green-400",
  };

  const statusBadges = {
    pending: "bg-red-100 text-red-800",
    started: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      let get = await getUser("user");
      setUser(get);
      //   setToken(get.access_token);
      getAllTasks(get.access_token);
    } catch (error) {
      notify("Error initializing data", "error");
    }
  };

  const handleClick = () => {
    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker();
    }
  };

  // Mock API call to fetch employees and tasks
  const getAllTasks = async (token) => {
    try {
      const response = await axios.get(`${API}/assign-detail`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setAssignedTasks(response.data.assigned_tasks);
      } else {
        notify("Issue in fetching Employees", "error");
      }
    } catch (error) {
      notify(error.message || "Error fetching employees", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Task Item Component
  const TaskItem = ({ task }) => {
    return (
      <div
        className={`${statusColors[task.status]} rounded-md shadow-sm p-3 mb-2`}
      >
        <div className="flex justify-between">
          <h4 className="font-medium text-gray-800">{task.task_name}</h4>
          <div className="flex space-x-2"></div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="mr-2">Assigned by:</span>
            <span className="font-medium">{task.assigner?.name || "N/A"}</span>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusBadges[task.status]
            }`}
          >
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>
      </div>
    );
  };

  // Task Status Section Component
  const TaskStatusSection = ({ title, tasks, icon, color }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="mb-4">
        <div
          className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${color}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            {icon}
            <h3 className="font-semibold ml-2">
              {title} ({tasks.length})
            </h3>
          </div>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {isExpanded && (
          <div className="mt-2 space-y-2">
            {tasks.length > 0 ? (
              tasks.map((task) => <TaskItem key={task.id} task={task} />)
            ) : (
              <p className="text-gray-500 text-sm italic py-2">
                No tasks in this category
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Employee Detail Modal Component
  const EmployeeDetailModal = ({ employee }) => {
    if (!employee) return null;

    // Get employee tasks filtered by selected date
    const employeeTasks = assignedTasks.filter(
      (task) => task.date === selectedDate
    );
    // Group tasks by status
    const tasksByStatus = {
      started: employeeTasks.filter((task) => task.status === "started"),
      pending: employeeTasks.filter((task) => task.status === "pending"),
      completed: employeeTasks.filter((task) => task.status === "completed"),
    };

    return (
      //   <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center overflow-y-auto p-4">
    //   <div
    //     className="bg-white w-full max-w-xl rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out"
    //     onClick={(e) => e.stopPropagation()}
    //   >
        <div className="p-4 max-h-96 md:max-h-screen md:h-auto overflow-y-auto">
       

          <TaskStatusSection
            title="In Process"
            tasks={tasksByStatus.started}
            icon={<Clock size={18} className="text-yellow-600" />}
            color="bg-yellow-100"
          />

          <TaskStatusSection
            title="Pending"
            tasks={tasksByStatus.pending}
            icon={<Clock size={18} className="text-red-600" />}
            color="bg-red-100"
          />

          <TaskStatusSection
            title="Completed"
            tasks={tasksByStatus.completed}
            icon={<Check size={18} className="text-green-600" />}
            color="bg-green-100"
          />
        </div>
    //   </div>
      //   </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      {/* <header className="bg-white shadow-sm"> */}
<div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-end items-end">
          
          <input
            ref={inputRef}
            type="date"
            className="ml-4 pl-3 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedDate}
            onChange={handleDateChange}
            onClick={handleClick}
          />
        </div>
      {/* </header> */}
      <EmployeeDetailModal employee={user} />
    </div>
  );
}
