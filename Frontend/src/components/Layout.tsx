import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import {
  Users,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Plus,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const managerNavItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Projects", icon: Calendar, path: "/projects" },
    { name: "Team Overview", icon: Users, path: "/team" },
    { name: "Create Project", icon: Plus, path: "/create-project" },
    { name: "Create Assignment", icon: Calendar, path: "/create-assignment" },
  ];

  const engineerNavItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Profile", icon: User, path: "/profile" },
    // { name: "My Assignments", icon: Calendar, path: "/assignments" },
  ];

  const navItems =
    user?.role === "manager" ? managerNavItems : engineerNavItems;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-lvh overflow-hidden bg-background flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-sidebar-foreground">
              ERM System
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-sidebar-foreground">
                  {user?.name}
                </p>
                <p className="text-sm text-sidebar-muted-foreground capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start cursor-pointer"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <div className="bg-card shadow-sm border-b border-border px-4 py-3 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-accent text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <ThemeToggle />
        </div>

        {/* Page Content */}
        <main className="flex-1 h-screen overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
