import React, { useEffect, useState } from "react";
import { API, notify } from "../utils/common";
import { addUser, getUser } from "../indexedDB";
import { ToastContainer, toast } from "react-toastify";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone_number: "",
    address: "",
    department: "",
    designation: "",
    date_of_joining: "",
    date_of_birth: "",
    employee_id: "",
    emergency_contact_phone: "",
    account_number: "",
    bank_name: "",
    ifsc_code: "",
    resume_path: "",
    id_proof_path: "",
    contract_path: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // const handleChange = (e) => {
  //   setProfile({ ...profile, [e.target.name]: e.target.value });
  // };
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

  const fetchData = async () => {
    try {
      const storedUser = await getUser("user");

      const accessToken = storedUser.access_token; // Get token directly

      setToken(accessToken); // (optional) update token state if needed

      const response = await fetch(`${API}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`, // Use directly here
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const result = await response.json();
      const user = result.data;
      if (user.role === "Admin") {
        setIsAdmin(true);
      }

      setProfile({
        id: user.id || "",
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        department: user.employee?.department || "",
        designation: user.employee?.designation || "",
        date_of_joining: user.employee?.date_of_joining || "",
        employee_id: user.employee_id || "",
        emergency_contact_phone: user.employee?.emergency_contact_phone || "",
        account_number: user.employee?.account_number || "",
        bank_name: user.employee?.bank_name || "",
        date_of_birth: user.date_of_birth || "",
        ifsc_code: user.employee?.ifsc_code || "",
        resume_path: user.employee?.resume_path || "",
        id_proof_path: user.employee?.id_proof_path || "",
        contract_path: user.employee?.contract_path || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const formData = new FormData();

      // Append all profile fields including files
      Object.entries(profile).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const response = await fetch(`${API}/profile-save`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.status) {
        notify("Profile updated successfully!", "success");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
           <ToastContainer />
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-6">Profile Page</h1>
        {/* Basic Info */}
        <section className="mb-6 bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <input type="hidden" name="id" value={profile.id} />
            <div>
              <label className="block mb-1">Full Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                type="text"
                readOnly={!isAdmin}
                placeholder="Full Name"
                className="w-full border px-3 py-2 rounded-lg shadow-sm"
              />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input
                name="email"
                value={profile.email}
                onChange={handleChange}
                type="email"
                readOnly={!isAdmin}
                placeholder="Email"
                className="w-full border px-3 py-2 rounded-lg shadow-sm"
              />
            </div>
            <div>
              <label className="block mb-1">Phone Number</label>
              <input
                name="phone_number"
                value={profile.phone_number}
                onChange={handleChange}
                type="text"
                readOnly={!isAdmin}
                placeholder="Phone Number"
                className="w-full border px-3 py-2 rounded-lg shadow-sm"
              />
            </div>
            <div>
              <label className="block mb-1">Address</label>
              <input
                name="address"
                value={profile.address}
                onChange={handleChange}
                type="text"
                readOnly={!isAdmin}
                placeholder="Address"
                className="w-full border px-3 py-2 rounded-lg shadow-sm"
              />
            </div>
            <div>
              <label className="block mb-1">Date of Birth</label>
              <input
                name="date_of_birth"
                value={profile.date_of_birth}
                onChange={handleChange}
                type="date"
                readOnly={!isAdmin}
                className="w-full border px-3 py-2 rounded-lg shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        {isAdmin && (
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </form>
      {!isAdmin && (
        <>
          {/* Job Info */}
          <section className="mb-6 bg-white shadow rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Job Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Department</label>
                <input
                  name="department"
                  value={profile.department}
                  onChange={handleChange}
                  type="text"
                  readOnly
                  placeholder="Department"
                  className="w-full border px-3 py-2 rounded-lg shadow-sm"
                />
              </div>
              <div>
                <label className="block mb-1">Designation</label>
                <input
                  name="designation"
                  value={profile.designation}
                  onChange={handleChange}
                  type="text"
                  readOnly
                  placeholder="Designation"
                  className="w-full border px-3 py-2 rounded-lg shadow-sm"
                />
              </div>
              <div>
                <label className="block mb-1">Date of Joining</label>
                <input
                  name="date_of_joining"
                  value={profile.date_of_joining}
                  onChange={handleChange}
                  type="date"
                  readOnly
                  className="w-full border px-3 py-2 rounded-lg shadow-sm"
                />
              </div>
              <div>
                <label className="block mb-1">Employee ID</label>
                <input
                  name="employee_id"
                  value={profile.employee_id}
                  readOnly
                  className="w-full border px-3 py-2 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          {/* Documents */}
          <section className="mb-6 bg-white shadow rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            {["resume", "id_proof", "contract"].map((doc) => (
              <div key={doc} className="mb-4">
                <label className="block mb-1 capitalize">
                uploaded  {doc.replace("_", " ")} 
                </label>
                {profile[`${doc}_path`] && (
                  <a
                    href={`http://localhost:8000${profile[`${doc}_path`]}`}
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
                  readOnly
                  placeholder="Emergency Contact"
                  className="w-full border px-3 py-2 rounded-lg shadow-sm"
                />
              </div>
              <div>
                <label className="block mb-1">Bank Account Number</label>
                <input
                  name="account_number"
                  value={profile.account_number}
                  onChange={handleChange}
                  type="text"
                  readOnly
                  placeholder="Bank Account Number"
                  className="w-full border px-3 py-2 rounded-lg shadow-sm"
                />
              </div>
              <div>
                <label className="block mb-1">IFSC Code</label>
                <input
                  name="ifsc_code"
                  value={profile.ifsc_code}
                  onChange={handleChange}
                  type="text"
                  readOnly
                  placeholder="IFSC code"
                  className="w-full border px-3 py-2 rounded-lg shadow-sm"
                />
              </div>
              <div>
                <label className="block mb-1">Bank Name</label>
                <input
                  name="bank_name"
                  value={profile.bank_name}
                  onChange={handleChange}
                  type="text"
                  readOnly
                  placeholder="Bank Name"
                  className="w-full border px-3 py-2 rounded-lg shadow-sm"
                />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
