import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { API, notify, getInitials } from "../utils/common";
import { addUser, getUser } from "../indexedDB";
import CustomConfirmModal from "../components/CustomConfirmModal";
import { useNavigate } from "react-router-dom";

function Employees() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [token, setToken] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [id, setId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const modalRef = useRef(null);
  const confirmRef = useRef(null);
  const sumarryRef = useRef(null);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    department: "",
    designation: "",
    date_of_joining: "",
    date_of_birth: "",
    password: "",
    confirm_password: "",
    emergency_contact_phone: "",
    account_number: "",
    bank_name: "",
    ifsc_code: "",
    resume_path: "",
    id_proof_path: "",
    contract_path: "",
    status: "",
  });

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const storedUser = await getUser("user");
    if (storedUser) {
      setToken(storedUser.access_token);
    }
    fetchRecords(storedUser.access_token);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
        setIsEdit(false);
        resetForm();
        setErrors({});
      }
    }

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      console.log("outside");
      if (confirmRef.current && !confirmRef.current.contains(event.target)) {
        setShowConfirmModal(false);
        console.log("inside");
      }
    };

    if (showConfirmModal) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showConfirmModal]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      console.log("outside");
      if (sumarryRef.current && !sumarryRef.current.contains(event.target)) {
        setShowSummary(false);
        setSummary({});
        setSelectedDate(null);
        console.log("inside");
      }
    };

    if (showSummary) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showSummary]);

  // useEffect(()=>{
  //   resetForm();
  // },[showModal]);

  const resetForm = () => {
    setProfile((prev) =>
      Object.fromEntries(Object.keys(prev).map((key) => [key, ""]))
    );
  };

  const fetchRecords = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/employees`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status) {
        setRecords(data.users); // Assuming data.data contains the records
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

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;

    if (type === "file") {
      const file = files[0];
      if (!file || !name) return;

      // Store File object directly
      setProfile((prev) => ({
        ...prev,
        [name]: file, // Ex: resume, id_proof, contract
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrors({});
      const formData = new FormData();

      Object.entries(profile).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const response = await fetch(`${API}/profile-save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok && response.status === 422) {
        // Validation error
        setErrors(result.errors || {});
        notify("Please fix the form errors", "error");
      } else if (response.ok && result.status) {
        notify("Profile updated successfully!", "success");
        fetchRecords(token);
        setShowModal(false);
      } else {
        notify(result.message || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      notify("Something went wrong. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (record) => {
    setProfile(record);
    setIsEdit(true);
    console.log(records);
    setShowModal(true); // Show the modal
  };
  console.log(errors);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.status) {
        notify("User Deleted Successfully", "success");
        fetchRecords(token);
      } else {
        notify(data.message || "Failed to fetch records", "error");
      }
    } catch (err) {
      console.error(err);
      notify(err || "Error fetching records", "error");
    }
  };

  const confirmTakeLeave = () => {
    setShowConfirmModal(false);
    handleDelete(id);
  };

  const cancelTakeLeave = () => {
    setShowConfirmModal(false);
  };

  const hadleMonthSummary = async (id, year = null, month = null) => {
    setLoadingSummary(true); // Start loader
    try {
      const response = await fetch(`${API}/summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: id,
          year: year,
          month: month,
        }),
      });

      const data = await response.json();
      if (data.status) {
        console.log(data);
        // console.log("Summary", summary);
        setSummary(data);
      } else {
        notify(data.message, "error");
        setSummary({});
      }
    } catch (err) {
      console.error(err);
      notify("Error fetching summary.", "error");
    } finally {
      setLoading(false);
      setLoadingSummary(false); // Stop loader
    }
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const handleViewDetails = () => {
    navigate(`/attendance/${id}`, {
      state: { name },
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <ToastContainer />
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <ToastContainer />
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Employee
        </button>
      </div>
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300 shadow-sm">
            <thead className="bg-blue-100 text-blue-800 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 border">#</th>
                <th className="px-4 py-3 border">Profile</th>
                <th className="px-4 py-3 border">Name</th>
                <th className="px-4 py-3 border">Designation</th>
                <th className="px-4 py-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record, index) => (
                  <tr
                    key={record.id}
                    className="hover:bg-blue-50 transition duration-200"
                  >
                    <td className="px-4 py-2 border text-center">
                      {record.employee_id}
                    </td>

                    <td className="px-4 py-2 border text-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full mx-auto flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(record.name)}
                      </div>
                    </td>

                    <td className="px-4 py-2 border text-center">
                      {record.name}
                    </td>

                    <td className="px-4 py-2 border text-center">
                      {record.role}
                    </td>

                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => {
                          setId(record.id);
                          setName(record.name);
                          setShowSummary(true);
                          hadleMonthSummary(record.id);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>
                      <br />
                      <button
                        onClick={() => {
                          handleEdit(record);
                          setId(record.id);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <br />
                      <button
                        onClick={() => {
                          setId(record.id);
                          setShowConfirmModal(true);
                        }}
                        // onClick={() => handleDelete(record.id)}
                        className="text-blue-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-4 text-gray-500 border"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {showConfirmModal && (
            <CustomConfirmModal
              ref={confirmRef}
              message="Are you sure you want to delete Employee?"
              onConfirm={confirmTakeLeave}
              onCancel={cancelTakeLeave}
            ></CustomConfirmModal>
          )}

          {showSummary && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div
                ref={sumarryRef}
                className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full"
              >
                {/* Date Filter Section */}
                <div className="flex flex-col mb-4 space-y-2">
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
                  <div className="flex justify-between space-x-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex-1"
                      onClick={() => {
                        if (selectedDate) {
                          const [year, month] = selectedDate.split("-");
                          //  fetchRecords(parseInt(year), parseInt(month));
                          hadleMonthSummary(
                            id,
                            parseInt(year),
                            parseInt(month)
                          );
                        } else {
                          toast.warn("Please select a date first.");
                        }
                      }}
                    >
                      Search
                    </button>
                    <button
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400 flex-1"
                      onClick={() => {
                        setSelectedDate("");
                        hadleMonthSummary(id); 
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Summary Info */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">
                    {selectedDate
                      ? `Summary for ${new Date(selectedDate).toLocaleString(
                          "default",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}`
                      : "This Month's Summary"}
                  </h3>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
                    onClick={handleViewDetails}
                  >
                    View details
                  </button>
                </div>

                {loadingSummary ? (
                  <div className="flex items-center justify-center py-10">
                    <svg
                      className="animate-spin h-6 w-6 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <ul className="text-sm space-y-2 text-gray-700">
                    <li>Total Days: {summary.total_days}</li>
                    <li>Present: {summary.present}</li>
                    <li>Leaves: {summary.leaves}</li>
                    <li>Late Logins: {summary.late_logins}</li>
                    <li>Early Logouts: {summary.early_logouts}</li>
                  </ul>
                )}
                <button
                  className="mt-6 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={() => {
                    setShowSummary(false);
                    setSummary({});
                    setSelectedDate(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
              <form onSubmit={handleSubmit}>
                <div
                  ref={modalRef}
                  className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                >
                  <h2 className="text-xl font-bold mb-4">
                    {/* Add New Employee */}
                    {isEdit ? "Edit Employee" : "Add New Employee"}
                  </h2>
                  {/* Basic Info */}
                  <section className="mb-6 bg-white shadow rounded-xl p-4">
                    <h2 className="text-lg font-semibold mb-4">
                      Basic Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">Full Name</label>
                        <input
                          name="name"
                          value={profile.name}
                          onChange={handleChange}
                          type="text"
                          placeholder="Full Name"
                          required
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.name[0]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1">Email</label>
                        <input
                          name="email"
                          value={profile.email}
                          onChange={handleChange}
                          type="email"
                          placeholder="Email"
                          required
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.email[0]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1">Phone Number</label>
                        <input
                          name="phone_number"
                          value={profile.phone_number}
                          onChange={handleChange}
                          type="text"
                          placeholder="Phone Number"
                          required
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.phone_number && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.phone_number[0]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1">Address</label>
                        <input
                          name="address"
                          value={profile.address}
                          onChange={handleChange}
                          type="text"
                          placeholder="Address"
                          required
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.address && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.address[0]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1">Date of Birth</label>
                        <input
                          name="date_of_birth"
                          value={profile.date_of_birth}
                          onChange={handleChange}
                          type="date"
                          required
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.date_of_birth && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.date_of_birth[0]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1">Status</label>
                        <select
                          name="status"
                          value={profile.status}
                          onChange={handleChange}
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        {errors.status && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.status[0]}
                          </p>
                        )}
                      </div>
                      {!isEdit && (
                        <>
                          <div>
                            <label className="block mb-1">Password</label>
                            <input
                              name="password"
                              value={profile.password}
                              type="password"
                              onChange={handleChange}
                              placeholder="Password"
                              required
                              className="w-full border px-3 py-2 rounded-lg shadow-sm"
                            />
                            {errors.password && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.password[0]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block mb-1">
                              Confirm Password
                            </label>
                            <input
                              name="password_confirmation"
                              value={profile.password_confirmation}
                              type="password"
                              onChange={handleChange}
                              placeholder="Confirm Password"
                              required
                              className="w-full border px-3 py-2 rounded-lg shadow-sm"
                            />
                            {errors.password_confirmation && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.password_confirmation[0]}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </section>

                  {/* Job Info */}
                  <section className="mb-6 bg-white shadow rounded-xl p-4">
                    <h2 className="text-lg font-semibold mb-4">
                      Job Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">Department</label>
                        <input
                          name="department"
                          value={profile.department}
                          onChange={handleChange}
                          type="text"
                          placeholder="Department"
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.department && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.department[0]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1">Designation</label>
                        <input
                          name="designation"
                          value={profile.designation}
                          onChange={handleChange}
                          type="text"
                          placeholder="Designation"
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.designation && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.designation[0]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1">Date of Joining</label>
                        <input
                          name="date_of_joining"
                          value={profile.date_of_joining}
                          onChange={handleChange}
                          type="date"
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.date_of_joining && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.date_of_joining[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Documents */}
                  <section className="mb-6 bg-white shadow rounded-xl p-4">
                    <h2 className="text-lg font-semibold mb-4">Documents</h2>
                    {["resume", "id_proof", "contract"].map((doc) => (
                      <div key={doc} className="mb-4">
                        <label className="block mb-1 capitalize">
                          {doc.replace("_", " ")} upload
                        </label>
                        <input
                          type="file"
                          name={doc}
                          onChange={handleChange}
                          className="block w-full text-sm border rounded-lg p-2"
                        />
                        {profile[`${doc}_path`] && (
                          <a
                            href={`http://localhost:8000${
                              profile[`${doc}_path`]
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-sm mt-1 inline-block"
                          >
                            View Uploaded File
                          </a>
                        )}
                      </div>
                    ))}
                  </section>

                  {/* Emergency & Bank */}
                  <section className="mb-6 bg-white shadow rounded-xl p-4">
                    <h2 className="text-lg font-semibold mb-4">
                      Emergency & Bank Details
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">Emergency Contact</label>
                        <input
                          name="emergency_contact_phone"
                          value={profile.emergency_contact_phone}
                          onChange={handleChange}
                          type="text"
                          placeholder="Emergency Contact"
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.emergency_contact_phone && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.emergency_contact_phone[0]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1">
                          Bank Account Number
                        </label>
                        <input
                          name="account_number"
                          value={profile.account_number}
                          onChange={handleChange}
                          type="text"
                          placeholder="Bank Account Number"
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.account_number && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.account_number[0]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1">IFSC Code</label>
                        <input
                          name="ifsc_code"
                          value={profile.ifsc_code}
                          onChange={handleChange}
                          type="text"
                          placeholder="IFSC code"
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.ifsc_code && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.ifsc_code[0]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1">Bank Name</label>
                        <input
                          name="bank_name"
                          value={profile.bank_name}
                          onChange={handleChange}
                          type="text"
                          placeholder="Bank Name"
                          className="w-full border px-3 py-2 rounded-lg shadow-sm"
                        />
                        {errors.bank_name && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.bank_name[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Save Button */}
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setIsEdit(false);
                      resetForm();
                      setErrors({});
                    }}
                    className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Employees;
