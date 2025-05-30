import React, { useEffect, useRef, useState } from "react";
import { API, notify, fetchHolidays } from "../utils/common";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";
import { X, Eye } from "lucide-react";
import { useParams } from "react-router-dom";
import { getUser } from "../indexedDB";
import { useLocation } from "react-router-dom";

export default function AttendanceDetailSheet() {
  const [user, setUser] = useState(null);
  const [eod, setEod] = useState("");
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [token, setToken] = useState("");
  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState("");
  const inputRef = useRef(null);
  const { id } = useParams();
  const location = useLocation();
  const name = location.state?.name;




  console.log(name);

  const handleClick = () => {
    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker();
    }
  };
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const storedUser = await getUser("user");
    if (storedUser) {
      setToken(storedUser.access_token);
      setUser(storedUser); // Set the user in the global state
      fetchRecords(null, null, storedUser.access_token);
    }
    setLoading(false); // hide loader after check
  };

  const fetchRecords = async (year = null, month = null, token) => {
    setLoading(true);
    try {
      const payload = {};

      if (year && month) {
        payload.year = year;
        payload.month = month;
      }
      payload.id = id;

      const response = await fetch(`${API}/detailed-sheet`, {
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
        setRecords(data.records); 
        setSummary(data.summary.original);

        console.log(data.summary.original);
      } else {
        // toast.error(data.message || "Failed to fetch records");
        setRecords([]);
        setSummary("");
      }
    } catch (err) {
      console.warning(err);
      toast.error("Error fetching records");
    } finally {
      setLoading(false);
    }
  };

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

  const DailyUpdateModal = ({ isUpdateModal, onClose, update }) => {
    console.log("yes");
    console.log(isUpdateModal);

    if (!isUpdateModal) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Daily Update
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 text-sm text-gray-700 whitespace-pre-line">
            {update || "No update available for this day."}
          </div>
          <div className="px-4 py-3 border-t bg-gray-50 text-right">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleViewClick = (update) => {
    setSelectedUpdate(update);
    setIsUpdateModal(true);
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
      <div className="flex">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 flex-1">
          {name}
        </h1>
        <div className="flex items-center justify-end mb-4 space-x-2">
          <label htmlFor="date" className="font-medium text-gray-700"></label>
          <input
            ref={inputRef}
            type="month"
            id="date"
            className="border rounded px-2 py-1 text-gray-700"
            value={selectedDate}
            // onChange={(e) => setSelectedDate(e.target.value)}
               onChange={(e) => {
                  const value = e.target.value;
                  setSelectedDate(value);

                  if (value) {
                    const [year, month] = value.split("-");
                    fetchRecords(parseInt(year), parseInt(month),token);
                  }
                }}
            onClick={handleClick}
          />
          {/* <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={() => {
              if (selectedDate) {
                const [year, month] = selectedDate.split("-");
                fetchRecords(parseInt(year), parseInt(month),token);
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
              fetchRecords(); 
            }}
          >
            Clear
          </button> */}
        </div>
      </div>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex gap-4">
          {/* Summary Section */}
          {/* <div className="grid grid-cols-2 gap-4 flex-1"> */}
          {/* <div className="bg-green-100 p-4 rounded-xl shadow flex-1">
            <h3 className="text-lg font-semibold mb-2">This Month's Summary</h3>
            <ul className="text-sm space-y-1">
              <li>Total Days: {summary.total_days} </li>
              <li>Present: {summary.present}</li>
              <li>Leaves: {summary.leaves}</li>
              <li>Late Logins: {summary.late_logins}</li>
              <li>Early Logouts: {summary.early_logouts}</li>
            </ul>
          </div> */}
        </div>

        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="flex px-6 py-3 border-b pb-2 my-2">
            <h1 className=" flex-1 text-3xl font-bold text-blue-800 tracking-wide mb-4 ">
              Attendance Sheet 
            </h1>
            <button
              onClick={exportToExcel}
              className="bg-blue-600 text-white rounded hover:bg-blue-700 px-4 py-2 h-fit"
            >
              Export to Excel
            </button>
          </div>
          {/* <button
            onClick={toggleSheet}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isViewSheet ? "Hide Sheet" : "View Sheet"}
          </button>
          {isViewSheet && (
            <> */}

          <table
            id="attendance-table"
            className="min-w-full divide-y divide-gray-200"
          >
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Day
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Login Time
                </th>

                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Logout Time
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Hours Worked
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Daily Update
                </th>
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
                    let rowClass =
                      "px-6 py-4 whitespace-nowrap text-sm text-gray-500  border border-gray-200";
                    if (isSaturdayOrSunday) {
                      rowClass += " bg-gray-600 text-white font-bold";
                    } else if (isLeave) {
                      rowClass += " bg-red-600 text-white font-bold";
                    } else if (isHoliday) {
                      rowClass += " bg-green-500 text-white font-bold";
                    }

                    return (
                      // <tr key={record.id} className={rowClass}>
                      <tr
                        key={record.id ?? `${record.date}-${index}`}
                        className={rowClass}
                      >
                        <td className="px-2 py-2 text-center">
                          {record.date
                            ? new Date(record.date).toLocaleDateString("en-GB")
                            : ""}
                        </td>
                        <td className="px-2 py-2 text-center">{record.day}</td>
                        <td className="text-center">
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
                        <td className="text-center">
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
                        <td className="text-center">{hoursWorked}</td>
                        <td className="text-center">{status}</td>
                        {/* <td className="px-4 py-2">
                            <textarea
                              value={eod}
                              readOnly
                              className="w-full max-w-[150px] h-20 resize-none overflow-auto p-2 border border-gray-300 rounded bg-gray-50 text-sm"
                            />
                          </td> */}
                        <td className="text-center">
                          {record.login_time && (
                            <button
                              className="p-2 text-grey-800 hover:text-blue-800 transition"
                              onClick={() => handleViewClick(eod)}
                              title="View"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
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
          {/* </>
          )} */}
        </div>

        {isUpdateModal && (
          <DailyUpdateModal
            isUpdateModal={isUpdateModal}
            onClose={() => setIsUpdateModal(false)}
            update={selectedUpdate}
          />
        )}
      </div>
    </div>
  );
}
