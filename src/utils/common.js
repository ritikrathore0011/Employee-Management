import { toast } from "react-toastify";
import axios from "axios";
import { useEffect } from "react";

export const API = "http://localhost:8000/api";

export const notify = (message, type = "default") => {
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

export const fetchHolidays = async () => {
  try {
    const response = await axios.get(`${API}/holidays`);
    if (response.data.status) {
      return response.data.holidays;
    } else {
      toast.error("Failed to fetch holidays.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error fetching holidays.");
  }
};

export function getInitials(sentence) {
  sentence = sentence.trim();

  const firstLetter = sentence[0]?.toUpperCase() || "";

  const spaceIndex = sentence.indexOf(" ");
  const secondLetter =
    spaceIndex !== -1 && sentence[spaceIndex + 1]
      ? sentence[spaceIndex + 1].toUpperCase()
      : "";

  return firstLetter + secondLetter;
}

export function useOutsideClick(ref, callback, active = true) {
  useEffect(() => {
    if (!active) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback, active]);
}

export default { API, notify, fetchHolidays, getInitials, useOutsideClick };
