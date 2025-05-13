
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../indexedDB";


function PublicRoute({ children }) {
  const [user, setUser] = useState(null);

  // Async function to check if the user is authenticated
  const checkAuth = async () => {
    const userData = await getUser('user'); // Fetch the user from IndexedDB
    setUser(userData);
  };

  useEffect(() => {
    checkAuth(); // Run the check on mount
  }, []);

  const isAuthenticated = !!user;

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;


}

export default PublicRoute;
