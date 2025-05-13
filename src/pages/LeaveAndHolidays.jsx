import React, { useState, useEffect } from "react";
import axios from "axios";
import { API, notify, fetchHolidays } from "../utils/common";
import { ToastContainer, toast } from "react-toastify";
import { addUser, getUser } from "../indexedDB";

export default function LeaveAndHolidaysPage() {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null); // <-- Add this
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const initData = async () => {
      init();
      const data = await fetchHolidays(); // now data contains actual holidays
      setHolidays(data);
    };

    initData();
  }, []);

  const init = async () => {
    const storedUser = await getUser("user");
    const accessToken = storedUser.access_token; // Get token directly
    setToken(accessToken);
    fetchLeaveRecords(accessToken);
    if (storedUser.role === "Admin") {
      setIsAdmin(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveType || !startDate || !endDate || !reason) {
      setMessage("Please fill all fields.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const response = await axios.post(
        `${API}/leaves`,
        {
          type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Replace `token` with your actual token variable
          },
        }
      );

      setMessage("Leave request submitted successfully!");
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      fetchLeaveRecords(token);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    }

    setIsSubmitting(false);
  };

  console.log(isAdmin);

  // useEffect(() => {
  //   fetchLeaveRecords();
  // }, [user]); // Run effect when the user is set

  const fetchLeaveRecords = async (token) => {
    // if (user && user.id) {
    // Make sure user and user.id exist
    try {
      const response = await axios.post(
        `${API}/leaves-status`,
        {}, // Your request body here
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLeaveRecords(response.data); // Assuming the API returns an array of leave requests
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch leave records.");
    }finally{
      setLoading(false);
    }
    // }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!holidayName || !holidayDate) {
      notify("Please fill in all fields.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API}/add-holiday`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: holidayName,
          date: holidayDate,
        }),
      });

      const data = await response.json();
      if (data.status) {
        notify("Holiday added successfully!", "success");
        // Clear the form
        setHolidayName("");
        setHolidayDate("");
        const holiday = await fetchHolidays();
        setHolidays(holiday);
      } else {
        // toast.error(data.message || "Failed to add holiday.");
        notify(data.message, data.status ? "success" : "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error adding holiday.", "error");
    } finally {
      setLoading(false);
    }
  };

  // const fetchHolidays = async () => {
  //   try {
  //     const response = await axios.get(`${API}/holidays`);
  //     console.log(response.data); // Add this to check the structure of the data
  //     if (response.data.status) {
  //       setHolidays(response.data.holidays);
  //       console.log("Holidays fetched:", response.data.holidays); // Check the fetched holidays data
  //     } else {
  //       toast.error("Failed to fetch holidays.");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Error fetching holidays.");
  //   }
  // };

  const handleLeave = async (leaveId, action) => {
    try {
      const response = await axios.post(
        `${API}/approve-leave`,
        { leaveId, action },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Assuming you're using token authentication
          },
        }
      );

      console.log(response.data); // Check response from server

      if (response.data.status) {
        toast.success(
          action === 1
            ? "Leave approved successfully!"
            : "Leave rejected successfully!"
        );
        fetchLeaveRecords(token); // Trigger UI update here
      } else {
        toast.error("Failed to process leave action.");
      }
    } catch (err) {
      console.error(err);
      notify("Error processing leave action.");
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
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Leave & Holidays</h1>

      {/* Leave Application Form
      {!isAdmin && (
        <section className="mb-8 bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Apply for Leave</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Leave Type (Sick, Casual...)"
              className="w-full border px-3 py-2 rounded-lg shadow-sm"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            />
            <input
              type="date"
              className="w-full border px-3 py-2 rounded-lg shadow-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <input
              type="date"
              className="w-full border px-3 py-2 rounded-lg shadow-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <textarea
              placeholder="Reason"
              rows="2"
              className="col-span-2 w-full border px-3 py-2 rounded-lg shadow-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Leave Request"}
          </button>
          {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
        </section>
      )} */}

      {showModal && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply for Leave
          </button>
          <form onSubmit={handleSubmit}>
            <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-lg relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
              >
                &times;
              </button>

              <h2 className="text-lg font-semibold mb-4">Apply for Leave</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Leave Type (Sick, Casual...)"
                  className="w-full border px-3 py-2 rounded-lg shadow-sm"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                />
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded-lg shadow-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded-lg shadow-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <textarea
                  placeholder="Reason"
                  rows="2"
                  className="col-span-2 w-full border px-3 py-2 rounded-lg shadow-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                // onClick={handleSubmit}
                disabled={isSubmitting}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Leave Request"}
              </button>
              {message && (
                <p className="mt-3 text-sm text-gray-600">{message}</p>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Leave History */}
      <section className="mb-8 bg-white shadow rounded-xl overflow-hidden">
        <h2 className="text-lg font-semibold px-4 py-3 border-b">
          Leave {isAdmin ? "Requests" : "History"}
        </h2>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">From</th>
              <th className="px-4 py-2">To</th>
              <th className="px-4 py-2">Status</th>
              {isAdmin && (
                <>
                  <th className="px-4 py-2">Employee Name</th>
                  <th className="px-4 py-2">Employee ID</th>
                  <th className="px-4 py-2">Actions</th>
                </>
              )}
              {/* Conditionally show columns for admin */}
            </tr>
          </thead>
          <tbody>
            {leaveRecords.length > 0 ? (
              leaveRecords.map((record, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{record.type}</td>
                  <td className="px-4 py-2">{record.start_date}</td>
                  <td className="px-4 py-2">{record.end_date}</td>
                  <td className="px-4 py-2 text-yellow-600 font-medium">
                    {record.status}
                  </td>
                  {isAdmin && ( // Render additional columns for admins only
                    <>
                      <td className="px-4 py-2">{record.user_name}</td>
                      <td className="px-4 py-2">{record.employee_id}</td>
                      <td className="px-4 py-2">
                        {/* <button
                    onClick={() => handleLeave(record.leave_id_encrypted, 1)} // Handle approval
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleLeave(record.leave_id_encrypted, 0)} // Handle rejection
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Reject
                  </button> */}
                        <button
                          onClick={() =>
                            handleLeave(record.leave_id_encrypted, 1)
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                          disabled={loading}
                        >
                          {loading ? "Processing..." : "Approve"}
                        </button>
                        <button
                          onClick={() =>
                            handleLeave(record.leave_id_encrypted, 0)
                          }
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          disabled={loading}
                        >
                          {loading ? "Processing..." : "Reject"}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 6 : 4} className="px-4 py-2 text-center">
                  No leave {isAdmin ? "request" : "record"} found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

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

      {isAdmin && (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h3 className="text-lg font-semibold">Add New Holiday</h3>
          <form onSubmit={handleAddHoliday}>
            <div className="mt-4">
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Holiday Name"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
              />
            </div>
            <button
              type="submit"
              onClick={handleAddHoliday}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Holiday"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
