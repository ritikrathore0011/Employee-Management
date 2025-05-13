import React, { useEffect, useRef, useState } from "react";
import { API, notify, fetchHolidays } from "../utils/common";
import { ToastContainer, toast } from "react-toastify";
import { addUser, getUser } from "../indexedDB";
import * as XLSX from "xlsx";

export default function AttendancePage() {
  const [user, setUser] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [note, setNote] = useState("");
  const [eod, setEod] = useState("");
  const [logId, setLogId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState("");
  const [summary, setSummary] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [forCheck, setForcheck] = useState(false);

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

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setShowProfile(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  useEffect(() => {
    if (user) {
      fetchRecords(); // Call once user is set
    }
  }, [user, checkedIn, checkedOut]);

  const init = async () => {
    const storedUser = await getUser("user");
    if (storedUser) {
      setUser(storedUser); // Set the user in the global state
      setToken(storedUser.access_token);
      await checkStatus(storedUser.access_token);
      const data = await fetchHolidays(); // now data contains actual holidays
      setHolidays(data);
    }
    setLoading(false); // hide loader after check
  };

  const checkStatus = async (token) => {
    try {
      const response = await fetch(`${API}/checkStatus`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status && data.record) {
        const record = data.record;
        console.log(record);
        if (record.note && !record.login_time && !record.logout_time) {
          console.log("yes leave ");
          notify("You're on leave today 🌴", "info");
          return; // stop further logic
        }

        if (record.login_time) {
          setCheckedIn(true);
          setCheckedOut(!!record.logout_time);
          setLogId(data.log_id);
          setNote(record.note || "");
        } else {
          setCheckedIn(false);
          setCheckedOut(false);
          setLogId(null);
          setNote("");
        }
      } else {
        setCheckedIn(false);
        setCheckedOut(false);
        setLogId(null);
        setNote("");
      }
      notify(data.message || "Status checked", "info");
    } catch (err) {
      notify(err.message || "Error in checkStatus", "error");
    }
  };

  const handleCheckIn = async () => {
    try {
      setForcheck(true);
      const response = await fetch(`${API}/check-in`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.status) {
        notify("✅ Checked in successfully", "success");
        setCheckedIn(true);
        setLogId(data.log_id);
      } else {
        notify("❌ Check-in failed", "error");
      }
    } catch (err) {
      notify("❗ Check-in error", "error");
    } finally {
      setForcheck(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setForcheck(true);
      const response = await fetch(`${API}/check-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          log_id: logId,
          note: note,
          eod: eod,
        }),
      });

      const data = await response.json();
      if (data.status) {
        notify("✅ Checked out successfully", "success");
        setCheckedOut(true);
      } else {
        notify("❌ Check-out failed", "error");
      }
    } catch (err) {
      console.warning(err);
      notify("❗ Check-out error", "error");
    } finally {
      setForcheck(true);
    }
  };

  // const handleSaveNote = async () => {
  //   try {
  //     const response = await fetch(`${API}/save-note`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         log_id: logId,
  //         note: note,
  //       }),
  //     });

  //     const data = await response.json();
  //     if (data.status) {
  //       notify("📝 Note saved successfully", "success");
  //       setNote("");
  //     } else {
  //       notify("❌ Failed to save note", "error");
  //     }
  //   } catch (err) {
  //     console.warning(err);
  //     notify("❗ Error saving note", "error");
  //   }
  // };

  const fetchRecords = async (year = null, month = null) => {
    // setLoading(true);
    try {
      const payload = {};

      if (year && month) {
        payload.year = year;
        payload.month = month;
      }

      const response = await fetch(`${API}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status) {
        setRecords(data.records); // ✅ Set directly from backend
        setSummary(data.summary.original);
      } else {
        toast.error(data.message || "Failed to fetch records");
        setRecords([]);
      }
    } catch (err) {
      console.warning(err);
      toast.error("Error fetching records");
    } finally {
      // setLoading(false);
    }
  };

  // const hadleMonthSummary = async (token) => {
  //   try {
  //     const response = await fetch(`${API}/summary`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       // body: JSON.stringify({
  //       //   name: holidayName,
  //       //   date: holidayDate,
  //       // }),
  //     });

  //     const data = await response.json();
  //     if (data.status) {
  //       notify("Holiday added successfully!", "success");
  //       // Clear the form
  //       setHolidayName("");
  //       setHolidayDate("");

  //       setTimeout(() => {
  //         fetchHolidays();
  //       }, 300); // 300ms delay
  //     } else {
  //       // toast.error(data.message || "Failed to add holiday.");
  //       notify(data.message, data.status ? "success" : "error");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     notify("Error adding holiday.", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const calculateHoursWorked = (loginTime, logoutTime) => {
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);

    // Calculate the difference in milliseconds
    const timeDiff = logout - login;

    if (timeDiff <= 0) {
      return "Invalid Time";
    }

    // Convert milliseconds into hours and minutes
    const hours = Math.floor(timeDiff / 1000 / 60 / 60);
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const exportToExcel = () => {
    const dataToExport = records.map((record) => ({
      Date: new Date(record.date).toLocaleDateString("en-GB"),
      Login: formatTime(record.login_time),
      Logout: formatTime(record.logout_time),
      Note: record.note,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "filtered_attendance.xlsx");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6 relative">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        📅 Attendance Page
      </h1>

      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* ✅ Section 1: Check-In / Check-Out */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center text-green-600 mb-4">
            Check-In Panel
          </h2>

          <div className="flex justify-between">
            <div className="text-center">
              {!checkedIn && !checkedOut ? (
                <button
                  onClick={handleCheckIn}
                  disabled={forCheck}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200"
                >
                  {forCheck ? "Checking In..." : "Check In"}
                </button>
              ) : checkedIn && !checkedOut ? (
                <button
                  onClick={handleCheckOut}
                  disabled={forCheck}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200"
                >
                  {forCheck ? "Checking Out..." : "Check Out"}
                </button>
              ) : (
                <div className="bg-green-100 text-green-800 px-6 py-3 rounded-xl shadow border border-green-300">
                  <p className="text-lg font-semibold">
                    You’ve done for today 🎉
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Note section */}
          {checkedIn && !checkedOut && (
            <div className="mt-6">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Write your note here (optional)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Write your Daily Update here."
                value={eod}
                onChange={(e) => setEod(e.target.value)}
                rows={4}
              ></textarea>

              {/* <button
                onClick={handleSaveNote}
                className="mt-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition duration-200"
              >
                Save Note
              </button> */}
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-xl overflow-hidden">
          <button
            onClick={exportToExcel}
            className="my-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export to Excel
          </button>
          <div className="flex items-center justify-end mb-4 space-x-2">
            <label htmlFor="date" className="font-medium text-gray-700">
              Filter by Month & Year:
            </label>
            <input
              type="month"
              id="date"
              className="border rounded px-2 py-1 text-gray-700"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => {
                if (selectedDate) {
                  const [year, month] = selectedDate.split("-");
                  fetchRecords(parseInt(year), parseInt(month));
                } else {
                  toast.warn("Please select a date first.");
                }
              }}
            >
              Search
            </button>
            <button
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              onClick={() => {
                setSelectedDate("");
                fetchRecords(); // fetch current month data again
              }}
            >
              Clear
            </button>
          </div>
          <table id="attendance-table" className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Login Time</th>
                <th className="px-4 py-2">Logout Time</th>
                <th className="px-4 py-2">Hours Worked</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Daily Update</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records
                  .slice()
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((record, index) => {
                    const note = record.note || "";
                    const eod = record.eod || "";

                    // Conditions
                    const isSaturdayOrSunday =
                      note.includes("Saturday") || note.includes("Sunday");
                    const isLeave =
                      (note.includes("Leave") || note.includes("leave")) &&
                      !record.login_time &&
                      !record.logout_time;
                    const isHoliday =
                      !record.login_time &&
                      !record.logout_time &&
                      note !== "" &&
                      typeof note === "string" &&
                      !isSaturdayOrSunday &&
                      !isLeave;

                    // // Calculate hours worked
                    const hoursWorked =
                      record.login_time && record.logout_time
                        ? calculateHoursWorked(
                            record.login_time,
                            record.logout_time
                          )
                        : "N/A";

                    // Set status based on conditions
                    let status = "";
                    if (isLeave) {
                      status = "Leave";
                    } else if (isHoliday) {
                      status = note;
                    } else if (isSaturdayOrSunday) {
                      status = "Weekend";
                    }

                    // Dynamic className
                    let rowClass = "border-t";
                    if (isSaturdayOrSunday) {
                      rowClass += " bg-black text-white font-bold";
                    } else if (isLeave) {
                      rowClass += " bg-red-600 text-white font-bold";
                    } else if (isHoliday) {
                      rowClass += " bg-green-600 text-white font-bold";
                    }

                    return (
                      // <tr key={record.id} className={rowClass}>
                      <tr
                        key={record.id ?? `${record.date}-${index}`}
                        className={rowClass}
                      >
                        <td className="px-4 py-2">
                          {record.date
                            ? new Date(record.date).toLocaleDateString("en-GB")
                            : ""}
                        </td>
                        <td className="px-4 py-2">
                          {record.login_time
                            ? new Date(record.login_time).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )
                            : ""}
                        </td>
                        <td className="px-4 py-2">
                          {record.logout_time
                            ? new Date(record.logout_time).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )
                            : ""}
                        </td>
                        <td className="px-4 py-2">{hoursWorked}</td>
                        <td className="px-4 py-2 text-sm font-semibold text-center">
                          {status}
                        </td>
                        <td className="px-4 py-2">
                          <textarea
                            value={eod}
                            readOnly
                            className="w-full max-w-[150px] h-20 resize-none overflow-auto p-2 border border-gray-300 rounded bg-gray-50 text-sm"
                          />
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">This Month's Summary</h3>
            <ul className="text-sm space-y-1">
              <li>Total Days: {summary.total_days} </li>
              <li>Present: {summary.present}</li>
              <li>Leaves: {summary.leaves}</li>
              <li>Late Logins: {summary.late_logins}</li>
              <li>Early Logouts: {summary.early_logouts}</li>
            </ul>
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
      </div>
    </div>
  );
}
