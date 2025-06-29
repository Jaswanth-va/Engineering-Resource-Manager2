import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./context/ThemeContext";
import { AlertContext, type AlertMessage } from "./context/alert";
import Alert from "./components/ui/alert";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ManagerDashboard from "./pages/ManagerDashboard";
import EngineerDashboard from "./pages/EngineerDashboard";
import EngineerProfile from "./pages/EngineerProfile";
import TeamOverview from "./pages/TeamOverview";
import Projects from "./pages/Projects";
import CreateAssignment from "./pages/CreateAssignment";
import CreateProject from "./pages/CreateProject";
import "./App.css";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === "manager") {
    return <ManagerDashboard />;
  } else {
    return <EngineerDashboard />;
  }
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const showAlert = (type: AlertMessage["type"], message: string) => {
    const id = Date.now().toString();
    setAlerts((prev) => [...prev, { id, type, message }]);

    // Auto-remove alert after 5 seconds
    setTimeout(() => {
      clearAlert(id);
    }, 5000);
  };

  const clearAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert, clearAlert }}>
      {/* Global Alert Display */}
      {alerts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              type={alert.type}
              message={alert.message}
              onClose={() => clearAlert(alert.id)}
              className="shadow-lg"
            />
          ))}
        </div>
      )}

      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/team"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Layout>
                <TeamOverview />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Layout>
                <Projects />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-project"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Layout>
                <CreateProject />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-assignment"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Layout>
                <CreateAssignment />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Engineer-only routes */}
        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={["engineer"]}>
              <Layout>
                <EngineerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["engineer"]}>
              <Layout>
                <EngineerProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AlertContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
