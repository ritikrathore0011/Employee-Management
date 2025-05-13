// components/CustomConfirmModal.jsx
import React, { forwardRef } from "react";

// const CustomConfirmModal = ({ message, onConfirm, onCancel, children }) => {
const CustomConfirmModal = forwardRef(
  ({ message, onConfirm, onCancel, children }, ref) => {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div
          ref={ref} // 👈 Move the ref here
          className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-md w-full"
        >
          <h2 className="text-lg font-semibold mb-4">{message}</h2>

          {children && <div className="mb-4">{children}</div>}

          <div className="flex justify-center gap-4">
            <button
              onClick={onConfirm}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Yes
            </button>
            <button
              onClick={onCancel}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default CustomConfirmModal;
