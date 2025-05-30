import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API, notify, fetchHolidays, useOutsideClick } from "../utils/common";
import { ToastContainer, toast } from "react-toastify";
import { addUser, getUser } from "../indexedDB";

export default function LeaveAndHolidaysPage() {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const modalRef = useRef(null);
  const holidayModalRef = useRef(null);
  const [showHolidayModal, setShowHolidayModal] = useState(false);

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

  const onClose = () => {
    setShowModal(false);
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setMessage("");
  };
  useOutsideClick(modalRef, onClose, showModal);

  const onHolidayClose = () => {
    setShowHolidayModal(false);
    setHolidayName("");
    setHolidayDate("");
  };

  useOutsideClick(holidayModalRef, onHolidayClose, showHolidayModal);

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
      if (response.data.status) {
        notify("Leave request submitted successfully!", "success");
        // setLeaveType("");
        // setStartDate("");
        // setEndDate("");
        // setReason("");
        onClose();
        fetchLeaveRecords(token);
      } else {
        notify("Something went wrong", "error");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    }

    setIsSubmitting(false);
  };

  const fetchLeaveRecords = async (token) => {
    try {
      const response = await axios.post(
        `${API}/leaves-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status) {
        setLeaveRecords(response.data.leaves);
      } else {
        notify("Something went wrong", "error");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch leave records.");
    } finally {
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
        onHolidayClose();
        const holiday = await fetchHolidays();
        setHolidays(holiday);
      } else {
        notify(data.message, data.status ? "success" : "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error adding holiday.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (leaveId, action) => {
    try {
      if (action === 1) {
        setIsApproving(true);
      } else {
        setIsRejecting(true);
      }
      const response = await axios.post(
        `${API}/approve-leave`,
        { leaveId, action },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status) {
        toast.success(
          action === 1
            ? "Leave approved successfully!"
            : "Leave rejected successfully!"
        );
        fetchLeaveRecords(token); 
      } else {
        toast.error("Failed to process leave action.");
      }
    } catch (err) {
      console.error(err);
      notify("Error processing leave action.");
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  const className = (status) => {
    if (status === "pending") {
      return "px-4 py-2 text-yellow-600 font-semibold capitalize";
    } else if (status === "rejected") {
      return "px-4 py-2 text-red-600 font-semibold capitalize";
    } else {
      return "px-4 py-2 text-green-600 font-semibold capitalize";
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const totalPages = Math.ceil(leaveRecords.length / recordsPerPage);
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = leaveRecords.slice(indexOfFirst, indexOfLast);

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
      {showModal && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <form onSubmit={handleSubmit}>
            <div
              className="bg-white w-full max-w-xl rounded-xl p-6 shadow-lg relative"
              ref={modalRef}
            >
              <button
                onClick={onClose}
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
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setEndDate(e.target.value);
                  }}
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
        <div className="flex justify-between px-4 py-3  items-center border-b">
          <h2 className="text-lg font-semibold">
            Leave {isAdmin ? "Requests" : "History"}{" "}
          </h2>
          {!isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Apply for Leave
            </button>
          )}
          {leaveRecords.length > recordsPerPage && (
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="self-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
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
            </tr>
          </thead>
          {/* <tbody>
            {leaveRecords.length > 0 ? (
              leaveRecords.map((record, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{record.type}</td>
                  <td className="px-4 py-2">{record.start_date}</td>
                  <td className="px-4 py-2">{record.end_date}</td>
                  <td className={className(record.status)}>{record.status}</td>
                  {isAdmin && (
                    <>
                      <td className="px-4 py-2">{record.user_name}</td>
                      <td className="px-4 py-2">{record.employee_id}</td>
                      {record.status === "pending" && (
                        <td className="px-4 py-2">
                          <button
                            onClick={() =>
                              handleLeave(record.leave_id_encrypted, 1)
                            }
                            className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                            disabled={isApproving}
                          >
                            {isApproving ? "Approving..." : "Approve"}
                          </button>
                          <button
                            onClick={() =>
                              handleLeave(record.leave_id_encrypted, 0)
                            }
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            disabled={isRejecting}
                          >
                            {isRejecting ? "Rejecting..." : "Reject"}
                          </button>
                        </td>
                      )}
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
          </tbody> */}
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((record, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">{record.type}</td>
                  <td className="px-4 py-2">{record.start_date}</td>
                  <td className="px-4 py-2">{record.end_date}</td>
                  <td className={className(record.status)}>{record.status}</td>
                  {isAdmin && (
                    <>
                      <td className="px-4 py-2">{record.user_name}</td>
                      <td className="px-4 py-2">{record.employee_id}</td>
                      {record.status === "pending" && (
                        <td className="px-4 py-2">
                          <button
                            onClick={() =>
                              handleLeave(record.leave_id_encrypted, 1)
                            }
                            className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                            disabled={isApproving}
                          >
                            {isApproving ? "Approving..." : "Approve"}
                          </button>
                          <button
                            onClick={() =>
                              handleLeave(record.leave_id_encrypted, 0)
                            }
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            disabled={isRejecting}
                          >
                            {isRejecting ? "Rejecting..." : "Reject"}
                          </button>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 7 : 4} className="px-4 py-2 text-center">
                  No leave {isAdmin ? "request" : "record"} found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="bg-yellow-50 p-4 rounded-xl shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Upcoming Holidays</h3>
          {isAdmin && (
            <button
              onClick={() => setShowHolidayModal(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Add Holiday
            </button>
          )}
        </div>

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

      {/* {isAdmin && (
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
      )} */}

      {isAdmin && showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"
            ref={holidayModalRef}
          >
            <button
              onClick={() => setShowHolidayModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">Add New Holiday</h3>
            <form onSubmit={handleAddHoliday}>
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Holiday Name"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Holiday"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
