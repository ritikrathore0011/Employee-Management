import React from 'react';

const Notification = ({ type, message }) => {
  const baseStyle = "p-4 rounded-md text-sm font-medium mb-4";
  const styles = {
    success: baseStyle + " bg-green-100 text-green-800 border border-green-300",
    error: baseStyle + " bg-red-100 text-red-800 border border-red-300",
  };

  return <div className={styles[type]}>{message}</div>;
};

export default Notification;
