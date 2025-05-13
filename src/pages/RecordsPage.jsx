import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { API, notify } from "../utils/common";


function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [selectedDate, setSelectedDate] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // Function to export the records to an Excel file
  const handleExport = () => {
    // Prepare the records data to match the table's format
    const exportData = records.map((record) => ({
      Date: record.date
        ? new Date(record.date).toLocaleDateString("en-GB")
        : "—",
      "Check-In": record.login_time
        ? new Date(record.login_time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "—",
      "Check-Out": record.logout_time
        ? new Date(record.logout_time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "—",
      Description: record.note || "—",
    }));

    // Convert the data to a worksheet format
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Records");

    // Trigger the download of the Excel file
    XLSX.writeFile(wb, "attendance_records.xlsx");
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const fetchRecords = async (year = null, month = null) => {
    setLoading(true);
    try {
      const payload = { user_id: user?.id };

      // Add month and year only if provided
      if (year && month) {
        payload.year = year;
        payload.month = month;
      }

      const response = await fetch(`${API}/records`, {
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

          if (
            (isSunday || isSaturday) &&
            (weekOfMonth === 2 || weekOfMonth === 4)
          ) {
            return {
              id: `leave-${dateStr}`,
              date: dateStr,
              login_time: null,
              logout_time: null,
              note: "Holiday (2nd/4th Saturday or Sunday)",
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-medium text-gray-600">Loading records...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <ToastContainer />
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Attendance Records
        </h2>

        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleExport}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Download Excel
          </button>
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
                  .map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-blue-50 transition duration-200"
                    >
                      <td className="px-4 py-2 border text-center">
                        {record.date
                          ? new Date(record.date).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {/* {console.log(record.login_time)} Log login_time */}
                        {record.login_time
                          ? new Date(record.login_time).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true, // Convert to 12-hour format
                              }
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {record.logout_time
                          ? new Date(record.logout_time).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true, // Convert to 12-hour format
                              }
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {record.note || "—"}
                      </td>
                    </tr>
                  ))
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
  );
}

export default RecordsPage;
