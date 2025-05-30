import { useState, useEffect, useRef } from "react";
import {
  Search,
  Check,
  X,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
} from "lucide-react";

import { getUser } from "../indexedDB";
import { API, notify, useOutsideClick } from "../utils/common";
import axios from "axios";
import { ToastContainer } from "react-toastify";

export default function EmployeeDashboard() {
  const [user, setUser] = useState({});
  const [token, setToken] = useState("");
  const [employees, setEmployees] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  ); // yyyy-mm-dd
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showByDate, setShowByDate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setToken(get.access_token);
      getAllEmployee(get.access_token);
    } catch (error) {
      notify("Error initializing data", "error");
    }
  };

  // Mock API call to fetch employees and tasks
  const getAllEmployee = async (token) => {
    try {
      const response = await axios.get(`${API}/assign-detail`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setEmployees(response.data.employees);
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

  // Get task counts by status for an employee
  const getTaskCounts = (empId) => {
    const tasks = assignedTasks.filter(
      (task) =>
        task.assigned_to === empId &&
        (showByDate ? task.date === selectedDate : true)
    );

    const started = tasks.filter((task) => task.status === "started").length;
    const pending = tasks.filter((task) => task.status === "pending").length;
    const completed = tasks.filter(
      (task) =>
        task.status === "completed" &&
        (!showByDate ? task.completed_at === selectedDate : true)
    ).length;

    // return { started, pending, completed, total: tasks.length };
    return {
      started,
      pending,
      completed,
      total: started + pending + completed,
    };
  };

  // Determine employee status based on their tasks
  const getEmployeeStatus = (empId) => {
    const tasks = assignedTasks.filter(
      (task) =>
        task.assigned_to === empId &&
        (showByDate ? task.date === selectedDate : true)
    );

    if (tasks.length === 0) return "idle";

    const hasStartedTasks = tasks.some((task) => task.status === "started");
    if (hasStartedTasks) return "working";

    const allCompletedTasks = tasks.every(
      (task) => task.status === "completed"
    );
    if (allCompletedTasks) return "idle";

    return "partial";
  };

  // Generate initials from name
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  // Filter employees based on search query and status filter
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const status = getEmployeeStatus(employee.id);

    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && status === statusFilter;
  });

  // Handle employee card click
  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  // Close modal
  const handleCloseAddModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const deleteTask = async (id) => {
    try {
      const response = await axios.post(
        `${API}/delete-task`,
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
        notify("Tasks Deleted successfully", "success");
        // setIsModalOpen(false);
        getAllEmployee(token);
      } else {
        notify(response.data.message || "Failed to delete tasks", "error");
      }
    } catch (error) {
      notify(error.message || "Error deleting task", "error");
    } finally {
      setIsAdding(false);
    }
  };

  // Status Tag Component
  const StatusTag = ({ status }) => {
    const statusConfig = {
      working: { color: "bg-green-100 text-green-800", label: "Working" },
      idle: { color: "bg-red-100 text-red-800", label: "Idle" },
      partial: { color: "bg-yellow-100 text-yellow-800", label: "Partial" },
    };

    const config = statusConfig[status];

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Task Item Component
  const TaskItem = ({ task }) => {
    return (
      <div
        className={`${statusColors[task.status]} rounded-md shadow-sm p-3 mb-2`}
      >
        <div className="flex justify-between">
          <h4 className="font-medium text-gray-800">{task.task_name}</h4>
          <div className="flex space-x-2">
            <button
              className="text-red-600 hover:text-red-800 transition-colors duration-200"
              title="Delete Task"
              onClick={(e) => {
                deleteTask(task.id);
                e.target.style.display = "none";
              }}
            >
              {task.status === "pending" && <X size={16} />}
            </button>
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
  const EmployeeDetailModal = ({ employee, isOpen, onClose }) => {
    if (!isOpen || !employee) return null;
    const modalRef = useRef();
    useOutsideClick(modalRef, onClose, isOpen);

    // Get employee tasks filtered by selected date
    const employeeTasks = assignedTasks.filter(
      (task) =>
        task.assigned_to === employee.id &&
        (showByDate ? task.date === selectedDate : true)
    );

    // Group tasks by status
    const tasksByStatus = {
      started: employeeTasks.filter((task) => task.status === "started"),
      pending: employeeTasks.filter((task) => task.status === "pending"),
      completed: employeeTasks.filter(
        (task) =>
          task.status === "completed" && task.completed_at === selectedDate
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
            <h2 className="text-xl font-bold text-gray-800">
              {employee.name}'s Tasks
            </h2>
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
                    {getInitials(employee.name)}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-800">{employee.name}</h3>
                  <StatusTag status={getEmployeeStatus(employee.id)} />
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <Calendar size={16} className="inline mr-1" />
                {selectedDate}
              </div>
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

          <div className="p-4 border-t bg-gray-50 flex justify-between">
            {!showByDate && (
              <button
                onClick={() => {
                  setShowModal(true);
                  setIsModalOpen(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Assign New Task
              </button>
            )}

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
  console.log(selectedEmployee);
  const AddTaskModal = ({ selectedemployee, showmodal, onClose }) => {
    // if (!selectedemployee || !showmodal) return null;
    if (!showmodal) return null;

    const [tasks, setTasks] = useState([{ name: "" }]);
    const [isAdding, setIsAdding] = useState(false);

    const addModalRef = useRef();
    useOutsideClick(addModalRef, onClose, showmodal);

    const handleChange = (index, e) => {
      const newTasks = [...tasks];
      newTasks[index].name = e.target.value;
      setTasks(newTasks);
    };

    const addTaskField = () => {
      setTasks([...tasks, { name: "" }]);
    };

    const removeTaskField = (index) => {
      const newTasks = tasks.filter((_, i) => i !== index);
      setTasks(newTasks);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const nonEmptyTasks = tasks
        .filter((task) => task.name.trim() !== "")
        .map((task) => task.name);

      if (!selectedEmployee || nonEmptyTasks.length === 0) {
        notify("Select employee and add at least one task", "error");
        return;
      }
      setIsAdding(true);
      try {
        const response = await axios.post(
          `${API}/assign-task`,
          {
            assigned_to: selectedEmployee.id,
            tasks: nonEmptyTasks,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status) {
          notify("Tasks assigned successfully", "success");
          setTasks([{ name: "" }]);
          setSelectedEmployee("");
          setShowModal(false);
          getAllEmployee(token);
        } else {
          notify(response.data.message || "Failed to assign tasks", "error");
        }
      } catch (error) {
        notify(error.message || "Error assigning tasks", "error");
      } finally {
        setIsAdding(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div
          ref={addModalRef}
          className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Assign Multiple Tasks
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee Dropdown */}

            {!selectedEmployee ? (
              <select
                value=""
                onChange={(e) =>
                  setSelectedEmployee(
                    employees.find((emp) => emp.id === Number(e.target.value))
                  )
                }
              >
                <option value="">-- Select Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_id} - {emp.name}
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <input type="text" value={selectedEmployee.name} readOnly />
              </div>
            )}

            {/* <div>
              <input type="text" value={selectedEmployee.name} readOnly />
            </div> */}

            {/* Task Inputs */}
            {tasks.map((task, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={task.name}
                  onChange={(e) => handleChange(index, e)}
                  placeholder={`Task ${index + 1}`}
                  className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTaskField(index)}
                    className="text-red-500 hover:text-red-700 text-xl font-bold"
                    title="Remove"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            {/* Add Task */}
            <button
              type="button"
              onClick={addTaskField}
              className="text-indigo-600 hover:underline text-sm"
            >
              + Add Another Task
            </button>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                disabled={isAdding}
              >
                {isAdding ? "Assigning" : "Assign"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleShowDate = () => {
    setShowByDate(true);
  };

  const handleHideDate = () => {
    setShowByDate(false);
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  // Employee Card Component
  const EmployeeCard = ({ employee, onClick }) => {
    const status = getEmployeeStatus(employee.id);
    const { started, pending, completed, total } = getTaskCounts(employee.id);

    return (
      <div
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-800 font-medium">
                {getInitials(employee.name)}
              </span>
            </div>
            <span className="text-xs mt-1 text-gray-700">
              {employee.employee_id}
            </span>

            <StatusTag status={status} />
          </div>

          <h3 className="font-medium text-lg text-gray-800 mb-2">
            {employee.name}
          </h3>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-1 bg-yellow-50 rounded text-yellow-700">
              <span className="font-semibold">{started}</span> Working
            </div>
            <div className="text-center p-1 bg-red-50 rounded text-red-700">
              <span className="font-semibold">{pending}</span> Pending
            </div>
            <div className="text-center p-1 bg-green-50 rounded text-green-700">
              <span className="font-semibold">{completed}</span> Done
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600">
          Total: {total} tasks for {selectedDate}
        </div>
      </div>
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

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {!showByDate ? (
                <button
                  onClick={handleShowDate}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow transition duration-200"
                >
                  <Calendar size={18} />
                  View By Date
                </button>
              ) : (
                <>
                  <div className="relative w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedDate}
                      onChange={handleDateChange}
                    />
                  </div>
                  <button
                    onClick={handleHideDate}
                    type="button"
                    className="text-red-500 border border-red-500 rounded-md px-2 py-1 hover:bg-red-100"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition duration-200"
              onClick={() => setShowModal(true)}
            >
              Assign task
            </button>

            <div className="flex space-x-2 w-full md:w-auto">
              <button
                className={`px-4 py-2 rounded-md ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
                onClick={() => setStatusFilter("all")}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  statusFilter === "working"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
                onClick={() => setStatusFilter("working")}
              >
                Working
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  statusFilter === "idle"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
                onClick={() => setStatusFilter("idle")}
              >
                Idle
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  statusFilter === "partial"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
                onClick={() => setStatusFilter("partial")}
              >
                Partial
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onClick={() => handleEmployeeClick(employee)}
            />
          ))}

          {filteredEmployees.length === 0 && (
            <div className="col-span-full text-center py-12">
              <User size={48} className="mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No employees found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
            </div>
          )}
        </div>
      </main>

      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <AddTaskModal
        selectedemployee={selectedEmployee}
        showmodal={showModal}
        onClose={handleCloseAddModal}
      />
    </div>
  );
}
