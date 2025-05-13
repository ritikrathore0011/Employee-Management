import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Employees from "./pages/Employees";
import Layout from "./components/Layout";
import ProfilePage from "./pages/ProfilePage";
import AttendancePage from "./pages/Attendance";
import LeaveAndHolidaysPage from "./pages/LeaveAndHolidays";
import EventsPage from "./pages/Events";
import PayrollPage from "./pages/Payroll";
import Unauthorized from "./pages/Unauthorized";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route: redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
      
        {/* 👈 new route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* Employees */}
        <Route
          path="/employees"
          element={
            // <PrivateRoute>
            <PrivateRoute requiredRole="Admin">
              <Layout>
                <Employees />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PrivateRoute requiredRole="Employee">
              <Layout>
                <AttendancePage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/leave-holidays"
          element={
            <PrivateRoute>
              <Layout>
                <LeaveAndHolidaysPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/events"
          element={
            <PrivateRoute>
              <Layout>
                <EventsPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <PrivateRoute>
              <Layout>
                <PayrollPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/unauthorized"
          element={
            <PrivateRoute>
              <Layout>
                <Unauthorized />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* Redirect all unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
