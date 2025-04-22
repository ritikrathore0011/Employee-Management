import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomConfirmModal from "../components/CustomConfirmModal";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import axios from "axios";

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [note, setNote] = useState("");
  const [logId, setLogId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [records, setRecords] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        await checkStatus(parsedUser);
      }
      setLoading(false); // hide loader after check
    };
    init();
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    if (user) {
      fetchRecords(); // Call once user is set
    }
  }, [user, checkedIn, checkedOut]);

  const notify = (message, type = "default") => {
    toast(message, {
      type,
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const checkStatus = async (userdata) => {
    try {
      const response = await fetch("http://localhost:8000/api/checkStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id: userdata.id }),
      });

      const data = await response.json();

      if (data.status && data.record) {
        const record = data.record;

        // 👉 If user has taken leave (note = 'leave')
        if (record.note && !record.login_time && !record.logout_time) {
          setCheckedIn(true);
          setCheckedOut(true);
          setLogId(null);
          setNote("leave"); // store note so we can disable buttons based on it
          localStorage.removeItem("log_id");
          localStorage.removeItem("checkInData");
          notify("You're on leave today 🌴", "info");
          return; // stop further logic
        }

        // 👉 If login_time is today, mark as checked in
        if (isToday(record.login_time)) {
          setCheckedIn(true);
          setCheckedOut(!!record.logout_time);
          setLogId(data.log_id);
          //setNote(record.note || ""); // save note if any
          localStorage.setItem("log_id", data.log_id);
          localStorage.setItem("checkInData", JSON.stringify(record));
        } else {
          // No record for today
          setCheckedIn(false);
          setCheckedOut(false);
          setLogId(null);
          setNote("");
          localStorage.removeItem("log_id");
          localStorage.removeItem("checkInData");
        }
      } else {
        setCheckedIn(false);
        setCheckedOut(false);
        setLogId(null);
        setNote("");
        localStorage.removeItem("log_id");
        localStorage.removeItem("checkInData");
      }

      notify(data.message || "Status checked", "info");
    } catch (err) {
      console.error("Error in checkStatus:", err);
      notify("Error checking in status", "error");
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id: user?.id }),
      });

      const data = await response.json();
      if (data.status) {
        notify("✅ Checked in successfully", "success");
        setCheckedIn(true);
        setLogId(data.log_id);
        localStorage.setItem("log_id", data.log_id);
      } else {
        notify("❌ Check-in failed", "error");
      }
    } catch (err) {
      console.error(err);
      notify("❗ Check-in error", "error");
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/check-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ log_id: logId }),
      });

      const data = await response.json();
      if (data.status) {
        notify("✅ Checked out successfully", "success");
        setCheckedOut(true);
      } else {
        notify("❌ Check-out failed", "error");
      }
    } catch (err) {
      console.error(err);
      notify("❗ Check-out error", "error");
    }
  };

  const handleSaveNote = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/save-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          log_id: logId,
          note: note,
        }),
      });

      const data = await response.json();
      if (data.status) {
        notify("📝 Note saved successfully", "success");
        setNote("");
      } else {
        notify("❌ Failed to save note", "error");
      }
    } catch (err) {
      console.error(err);
      notify("❗ Error saving note", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleLeave = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/take-leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: user?.id,
          note: note, // 👈 include note here
        }),
      });

      const data = await response.json();
      if (data.status) {
        notify("🌴 Leave marked successfully", "success");
        setCheckedIn(true);
        setCheckedOut(true);
        localStorage.removeItem("log_id");
        localStorage.removeItem("checkInData");
      } else {
        notify(data.message || "❌ Failed to mark leave", "error");
      }
    } catch (err) {
      console.error("Leave request error:", err);
      notify("❗ Error while requesting leave", "error");
    }
  };

  const handleTakeLeave = () => {
    setShowConfirmModal(true);
  };

  const confirmTakeLeave = () => {
    setShowConfirmModal(false);
    handleLeave(); // call actual logic here
  };

  const cancelTakeLeave = () => {
    setShowConfirmModal(false);
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Records");

    // Define header row
    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Check-In", key: "checkIn", width: 15 },
      { header: "Check-Out", key: "checkOut", width: 15 },
      { header: "Description", key: "description", width: 30 },
    ];
    // Apply styling to the header (red text color)
    // Apply styling to the header (white font color and red background)
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true }; // White font color
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF00008B" }, // Red background
      };
    });
    // Add rows
    records.forEach((record) => {
      worksheet.addRow({
        date: record.date
          ? new Date(record.date).toLocaleDateString("en-GB")
          : "",
        checkIn: record.login_time
          ? new Date(record.login_time).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "",
        checkOut: record.logout_time
          ? new Date(record.logout_time).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "",
        description: record.note || "",
      });
    });

    // Apply styling: Red background if Description is "hello"
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const descCell = row.getCell(4);

      if (descCell.value !== "—") {
        if (
          descCell.value.includes("Saturday") ||
          descCell.value.includes("Sunday")
        ) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FF000000" },
            };
            cell.font = {
              color: { argb: "FFFFFFFF" },
              bold: true,
            };
          });
        } else if (
          descCell.value.includes("Leave") ||
          descCell.value.includes("leave")
        ) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFF0000" },
            };
            cell.font = {
              color: { argb: "FFFFFFFF" },
              bold: true,
            };
          });
        } else {
          const checkInCell = row.getCell(2);
          const checkOutCell = row.getCell(3);
          const descCell = row.getCell(4);

          const checkInEmpty = !checkInCell.value || checkInCell.value === "";
          const checkOutEmpty =
            !checkOutCell.value || checkOutCell.value === "";
          const hasNote =
            descCell.value &&
            descCell.value !== "" &&
            typeof descCell.value === "string";

          if (checkInEmpty && checkOutEmpty && hasNote) {
            row.eachCell((cell) => {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF00FF00" }, // Green background for holiday
              };
              cell.font = {
                color: { argb: "FFFFFFFF" }, // White text
                bold: true,
              };
            });
          }
        }
      }
    });

    // Create file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "attendance_records.xlsx");
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const fetchRecords = async (year = null, month = null) => {
    // setLoading(true);
    try {
      const payload = { user_id: user?.id };

      // Add month and year only if provided
      if (year && month) {
        payload.year = year;
        payload.month = month;
      }

      const response = await fetch("http://localhost:8000/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status) {
        const today = new Date();
        const usedYear = year || today.getFullYear();
        const usedMonth = month ? month - 1 : today.getMonth(); // 0-based

        const firstDay = new Date(usedYear, usedMonth, 1);
        const lastDay = new Date(usedYear, usedMonth + 1, 0);

        const allDates = [];
        let d = new Date(firstDay);

        while (d <= lastDay) {
          allDates.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }

        const completeRecords = allDates.map((date) => {
          const dateStr = date.toLocaleDateString("en-CA");
          const existing = data.records.find((r) => r.date === dateStr);
          const isSunday = date.getDay() === 0;
          const isSaturday = date.getDay() === 6;
          const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;

          if (existing) return existing;

          if (isSaturday && (weekOfMonth === 2 || weekOfMonth === 4)) {
            return {
              id: `leave-${dateStr}`,
              date: dateStr,
              login_time: null,
              logout_time: null,
              note: "Saturday",
            };
          } else if (isSunday) {
            return {
              id: `leave-${dateStr}`,
              date: dateStr,
              login_time: null,
              logout_time: null,
              note: "Sunday",
            };
          }

          return {
            id: `empty-${dateStr}`,
            date: dateStr,
            login_time: null,
            logout_time: null,
            note: null,
          };
        });

        setRecords(completeRecords);
      } else {
        toast.error(data.message || "Failed to fetch records");
        setRecords([]); // Clear any old records
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching records");
    } finally {
      setLoading(false);
    }
  };


 let tokenClient = null;

const initGoogleTokenClient = () => {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: "778560140140-qruh67umtre36assgsg5r9b3p9k6of0b.apps.googleusercontent.com",
    scope:
      "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.metadata.readonly",  // Added Drive scope
    callback: (tokenResponse) => {
      // This gets overridden dynamically before each call
    },
  });
};

// Call this whenever you want to request the access token
const requestGoogleAccessToken = () => {
  if (!tokenClient) {
    initGoogleTokenClient();
  }

  // Override the callback *just before* requesting token
  tokenClient.callback = (tokenResponse) => {
    const accessToken = tokenResponse.access_token;
    localStorage.setItem("googleAccessToken", accessToken);
    console.log("Google Access Token:", accessToken);

    checkIfSheetExists(accessToken);  // Check for the sheet before creating
  };

  tokenClient.requestAccessToken(); // Always triggers fresh token request
};

// Function to check if a Google Sheet already exists
const checkIfSheetExists = async (accessToken) => {
  const title = "Nextige Attendance Sheet";  // Change as needed
  const query = `name='${title}' and mimeType='application/vnd.google-apps.spreadsheets' and trashed=false`;

  // Make a request to the Google Drive API to check for sheets by title
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();

  if (data.files && data.files.length > 0) {
    // Sheet exists
    const sheet = data.files[0];  // Get the first sheet that matches
    alert(`Sheet already exists: ${sheet.name}`);
    window.open(`https://docs.google.com/spreadsheets/d/${sheet.id}`, "_blank");
  } else {
    // Sheet doesn't exist, create a new one
    createGoogleSheet(accessToken);
  }
};

// Function to create a new Google Sheet if not found
const createGoogleSheet = async (accessToken) => {
  try {
    const res = await fetch("http://localhost:8000/api/create-google-sheet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ title: "Nextige Attendance Sheet" }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`Data updated successfully : ${data.url}`);
      window.open(data.url, "_blank");
    } else {
      console.error("Failed to create sheet:", data);
      alert(
        "Error creating Google Sheet: " + (data.error || "Unknown error")
      );
    }
  } catch (err) {
    console.error("Error uploading sheet:", err);
    alert(
      "An error occurred while creating the Google Sheet. Please try again."
    );
  }
};

  return (
    // <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6 relative">
      <ToastContainer />

      {/* Page Wrapper */}
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* ✅ Section 1: Check-In / Check-Out */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center text-green-600 mb-4">
            Check-In Panel
          </h2>

          <div className="absolute top-6 right-6 z-50" ref={dropdownRef}>
            <div className="relative">
              {/* 🔵 Initials Circle */}
              {/* <div
                className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold cursor-pointer shadow-md"
                onClick={() => setShowProfile(!showProfile)}
              >
                {user?.initials}
              </div> */}

              {user?.profile ? (
                <img
                  src={user.profile}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer shadow-md"
                  onClick={() => setShowProfile(!showProfile)}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold cursor-pointer shadow-md"
                  onClick={() => setShowProfile(!showProfile)}
                >
                  {user?.initials}
                </div>
              )}

              {/* 🔽 Dropdown */}
              {showProfile && (
                <div className="absolute right-0 mt-2 bg-white border rounded-xl shadow-lg p-4 w-48">
                  <p className="text-gray-800 font-semibold mb-2">
                    {user?.name}
                  </p>
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

          <div className="flex justify-between">
            <div className="text-center">
              {!checkedIn && !checkedOut ? (
                <button
                  onClick={handleCheckIn}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200"
                >
                  Check In
                </button>
              ) : checkedIn && !checkedOut ? (
                <button
                  onClick={handleCheckOut}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200"
                >
                  Check Out
                </button>
              ) : (
                <div className="bg-green-100 text-green-800 px-6 py-3 rounded-xl shadow border border-green-300">
                  <p className="text-lg font-semibold">
                    You’ve done for today 🎉
                  </p>
                </div>
              )}
            </div>

            {!checkedIn && !checkedOut && (
              <div className="text-center ">
                <button
                  onClick={handleTakeLeave}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-200"
                >
                  Take Leave
                </button>
              </div>
            )}
          </div>

          {/* Note section */}
          {checkedIn && !checkedOut && (
            <div className="mt-6">
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="Write your note here (optional)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
              ></textarea>
              <button
                onClick={handleSaveNote}
                className="mt-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition duration-200"
              >
                Save Note
              </button>
            </div>
          )}

          {/* Logout */}
          {/* <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="bg-gray-700 hover:bg-gray-800 text-white font-medium px-5 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div> */}

          {/* Show Take Leave only if not checked in or out */}
        </div>
        {showConfirmModal && (
          <CustomConfirmModal
            message="Are you sure you want to take leave for today?"
            onConfirm={confirmTakeLeave}
            onCancel={cancelTakeLeave}
          >
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Write your note here (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </CustomConfirmModal>
        )}

        {/* ✅ Section 2: Attendance Records */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex justify-between ">
            <h2 className="text-3xl font-bold text-left text-blue-600">
              Attendance Records
            </h2>

            <div>
              <button
                onClick={requestGoogleAccessToken}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Upload Sheet
              </button>
            </div>

            {/* Export Button */}
            <div className=" mb-4">
              <button
                onClick={handleExport}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Download Excel
              </button>
            </div>
          </div>
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

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300 shadow-sm">
              <thead className="bg-blue-100 text-blue-800 text-sm uppercase">
                <tr>
                  <th className="px-4 py-3 border">Date</th>
                  <th className="px-4 py-3 border">Check-In</th>
                  <th className="px-4 py-3 border">Check-Out</th>
                  <th className="px-4 py-3 border">Description</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records
                    .slice()
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((record) => {
                      const note = record.note || "";

                      // Conditions
                      const isSaturdayOrSunday =
                        note.includes("Saturday") || note.includes("Sunday");
                      const isLeave =
                        note.includes("Leave") || note.includes("leave");
                      const isHoliday =
                        !record.login_time &&
                        !record.logout_time &&
                        note !== "" &&
                        typeof note === "string" &&
                        !isSaturdayOrSunday &&
                        !isLeave;

                      // Dynamic className
                      let rowClass = " transition duration-200";
                      if (isSaturdayOrSunday) {
                        rowClass += " bg-black text-white font-bold";
                      } else if (isLeave) {
                        rowClass += " bg-red-600 text-white font-bold";
                      } else if (isHoliday) {
                        rowClass += " bg-green-600 text-white font-bold";
                      }

                      return (
                        <tr key={record.id} className={rowClass}>
                          <td className="px-4 py-2 border text-center">
                            {record.date
                              ? new Date(record.date).toLocaleDateString(
                                  "en-GB"
                                )
                              : ""}
                          </td>
                          <td className="px-4 py-2 border text-center">
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
                          <td className="px-4 py-2 border text-center">
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
                          <td className="px-4 py-2 border text-center">
                            {note}
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-4 text-gray-500 border"
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DashboardPage;
