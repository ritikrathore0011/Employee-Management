
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../indexedDB";

const PrivateRoute = ({ children, requiredRole, allowedRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await getUser("user");
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    checkUser();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Show loading while checking
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  const hasAccess =
    (requiredRole && user.role === requiredRole) ||
    (allowedRoles && allowedRoles.includes(user.role)) ||
    (!requiredRole && !allowedRoles); // Unrestricted if no roles specified

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;








//   if (user && user.id === 'user') {
//     console.log('User is logged in:', user);
//     // Allow login logic here (maybe update UI, etc.)
//     return true;
//   } else {
//     console.log('User is not logged in.');
//     // Redirect to login or show login screen
//     return false;
//   }
// \
