import { useState, useEffect, useRef } from "react";
import { X, CheckCircle } from "lucide-react";
import { getUser } from "../indexedDB";
import { API, notify, useOutsideClick, getInitials } from "../utils/common";
import axios from "axios";
import { Check, Clock, ChevronDown, ChevronUp, Play } from "lucide-react";

export default function DraggableTaskBox() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tasks, setTasks] = useState([]);
  const [token, setToken] = useState("");
  const [user, setUser] = useState({});
  const today = new Date().toISOString().split("T")[0];

  const circleRef = useRef(null);
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
    if (typeof window !== "undefined") {
      setPosition({
        x: window.innerWidth - 100,
        y: window.innerHeight - 100,
      });
    }
  }, []);

  const init = async () => {
    let get = await getUser("user");
    setUser(get);
    getAllTasks(get.access_token);
    setToken(get.access_token);
  };

  const getAllTasks = async (token) => {
    try {
      const response = await axios.get(`${API}/assign-detail`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setTasks(response.data.assigned_tasks);
      } else {
        notify("Issue in fetching Employees", "error");
      }
    } catch (error) {
      notify(error.message || "Error fetching employees", "error");
    }
  };

  const handleMouseDown = (e) => {
    if (isExpanded) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    if (isExpanded) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleCircleClick = () => {
    if (!isDragging) {
      setIsExpanded(true);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  const updateStatus = async (id) => {
    try {
      const response = await axios.post(
        `${API}/update-status`,
        {
          id: id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status) {
        notify("Status Updated successfully", "success");
        getAllTasks(token);
      } else {
        notify(response.data.message || "Failed to Upadte status", "error");
      }
    } catch (error) {
      notify(error.message || "Error Updating task", "error");
    }
  };

  const TaskItem = ({ task }) => {
    const handleActionClick = () => {
      updateStatus(task.id, 2);
    };

    return (
      <div
        className={`${statusColors[task.status]} rounded-md shadow-sm p-3 mb-2`}
      >
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-800">{task.task_name}</h4>
          <div className="flex space-x-2 items-center">
            {/* Show Start or Complete icon based on task status */}
            {task.status === "pending" && (
              <button
                title="Start Task"
                onClick={handleActionClick}
                className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
              >
                <Play size={18} />
              </button>
            )}
            {task.status === "started" && (
              <button
                title="Complete Task"
                onClick={handleActionClick}
                className="text-green-600 hover:text-green-800 transition-colors duration-200"
              >
                <CheckCircle size={18} />
              </button>
            )}
          </div>
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

  const EmployeeDetailModal = ({ employee, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    const modalRef = useRef();
    useOutsideClick(modalRef, onClose, isOpen);

    const tasksByStatus = {
      started: tasks.filter((task) => task.status === "started"),
      pending: tasks.filter((task) => task.status === "pending"),
      // completed: tasks.filter((task) => task.status === "completed"  ),
      completed: tasks.filter(
        (task) =>
          task.status === "completed" &&
          task.completed_at?.split("T")[0] === today
      ),
    };
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center overflow-y-auto p-4">
        <div
          className="bg-white w-full max-w-xl rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 ease-in-out"
          onClick={(e) => e.stopPropagation()}
          ref={modalRef}
        >
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">My Tasks</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 max-h-96 md:max-h-screen md:h-auto overflow-y-auto">
            <div className="mb-4 flex justify-between items-center pb-3 border-b">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-800 font-medium">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-800">{user.name}</h3>
                  <span>{user.employee_id}</span>
                </div>
              </div>

              {/* <div className="text-sm text-gray-600">
                <Calendar size={16} className="inline mr-1" />
                {selectedDate}
              </div> */}
            </div>

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

          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragStart]);

  return (
    <div className="font-['Inter',sans-serif]">
      <div
        ref={circleRef}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: isExpanded ? "scale(1.1) translateY(-40px)" : "scale(1)",
          opacity: isExpanded ? 0 : 1,
          pointerEvents: isExpanded ? "none" : "auto",
        }}
        className={`fixed flex z-50 items-center justify-center w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-full shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing
                    ring-2 ring-gray-100 text-blue-500 select-none`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleCircleClick}
      >
        <div className="relative">
          <span className="flex items-center justify-center text-blue-500">
            <CheckCircle size={20} />
          </span>
          {/* {tasks.length > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {tasks.length}
            </div>
          )} */}

          {tasks.filter(
            (task) => task.status === "pending" || task.status === "started"
          ).length > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {
                tasks.filter(
                  (task) =>
                    task.status === "pending" || task.status === "started"
                ).length
              }
            </div>
          )}
        </div>
      </div>

      {/* Expanded Modal */}

      <EmployeeDetailModal
        employee={user}
        isOpen={isExpanded}
        onClose={handleClose}
      />
    </div>
  );
}
