import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Login } from "./views/Login";

// Consumer Views
import { UserDashboard } from "./views/user/UserDashboard";
import { UserScanner } from "./views/user/UserScanner";
import { UserScans } from "./views/user/UserScans";
import { UserComplaints } from "./views/user/UserComplaints";
import { UserReports } from "./views/user/UserReports";

// Officer Views
import { OfficerDashboard } from "./views/officer/OfficerDashboard";
import { OfficerInspections } from "./views/officer/OfficerInspections";
import { OfficerScanner } from "./views/officer/OfficerScanner";
import { OfficerViolations } from "./views/officer/OfficerViolations";
import { OfficerProducts } from "./views/officer/OfficerProducts";
import { OfficerComplaints } from "./views/officer/OfficerComplaints";
import { OfficerCorrectiveActionReviews } from "./views/officer/OfficerCorrectiveActionReviews";
import { OfficerCaseDetail } from "./views/officer/OfficerCaseDetail";
import { OfficerReports } from "./views/officer/OfficerReports";
import { OfficerAnalytics } from "./views/officer/OfficerAnalytics";

// Manufacturer Views
import { ManufacturerDashboard } from "./views/manufacturer/ManufacturerDashboard";
import { ManufacturerProducts } from "./views/manufacturer/ManufacturerProducts";
import { ManufacturerCompliance } from "./views/manufacturer/ManufacturerCompliance";
import { ManufacturerViolations } from "./views/manufacturer/ManufacturerViolations";
import { ManufacturerCorrectiveActions } from "./views/manufacturer/ManufacturerCorrectiveActions";
import { ManufacturerReports } from "./views/manufacturer/ManufacturerReports";
import { LegalAdvisoryView } from "./views/LegalAdvisoryView";

// Shared Notifications Center
import { NotificationsView } from "./views/NotificationsView";
import { WelcomeSplash } from "./components/WelcomeSplash";

const AppRouter = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentPath, setCurrentPath] = useState(() => {
    const p = window.location.pathname;
    return p && p !== "/" ? p : "/login";
  });

  const navigate = (path) => {
    setCurrentPath(path);
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Handle URL changes & role guard redirects
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        if (currentPath !== "/login") {
          navigate("/login");
        }
      } else if (user) {
        const role = user.role || "user";
        if (currentPath === "/login" || currentPath === "/") {
          if (role === "officer") navigate("/officer/dashboard");
          else if (role === "manufacturer") navigate("/manufacturer/dashboard");
          else navigate("/user/dashboard");
        } else {
          // If path doesn't match role and isn't shared
          if (currentPath !== "/notifications" && currentPath !== "/legal-advisory") {
            if (role === "user" && !currentPath.startsWith("/user")) {
              navigate("/user/dashboard");
            } else if (role === "officer" && !currentPath.startsWith("/officer")) {
              navigate("/officer/dashboard");
            } else if (role === "manufacturer" && !currentPath.startsWith("/manufacturer")) {
              navigate("/manufacturer/dashboard");
            }
          }
        }
      }
    }
  }, [isAuthenticated, user, loading, currentPath]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        color: "#1e3a8a",
        fontSize: "1.05rem",
        fontWeight: 700
      }}>
        Initializing Legal Metrology System...
      </div>
    );
  }

  if (!isAuthenticated || currentPath === "/login") {
    return (
      <Login
        onLoginSuccess={(loggedInUser) => {
          setShowWelcome(true);
          if (loggedInUser.role === "officer") navigate("/officer/dashboard");
          else if (loggedInUser.role === "manufacturer") navigate("/manufacturer/dashboard");
          else navigate("/user/dashboard");
        }}
      />
    );
  }

  const renderView = () => {
    // Shared Notifications & Legal Advisory Views
    if (currentPath === "/notifications") {
      return <NotificationsView onNavigate={navigate} />;
    }
    if (currentPath === "/legal-advisory") {
      return <LegalAdvisoryView onNavigate={navigate} />;
    }

    const role = user?.role || "user";

    // Consumer Routes
    if (role === "user") {
      switch (currentPath) {
        case "/user/scan":
          return <UserScanner onNavigate={navigate} />;
        case "/user/scans":
          return <UserScans onNavigate={navigate} />;
        case "/user/complaints":
          return <UserComplaints onNavigate={navigate} />;
        case "/user/reports":
          return <UserReports onNavigate={navigate} />;
        case "/user/advisory":
          return <LegalAdvisoryView onNavigate={navigate} />;
        case "/user/dashboard":
        default:
          return <UserDashboard onNavigate={navigate} />;
      }
    }

    // Officer Routes
    if (role === "officer") {
      if (currentPath.startsWith("/officer/cases/")) {
        const caseId = currentPath.replace("/officer/cases/", "");
        return <OfficerCaseDetail caseId={caseId} onNavigate={navigate} />;
      }

      switch (currentPath) {
        case "/officer/complaints":
          return <OfficerComplaints onNavigate={navigate} />;
        case "/officer/corrective-actions":
          return <OfficerCorrectiveActionReviews onNavigate={navigate} />;
        case "/officer/inspections":
          return <OfficerInspections onNavigate={navigate} />;
        case "/officer/scan":
          return <OfficerScanner onNavigate={navigate} />;
        case "/officer/violations":
          return <OfficerViolations onNavigate={navigate} />;
        case "/officer/products":
          return <OfficerProducts onNavigate={navigate} />;
        case "/officer/reports":
          return <OfficerReports onNavigate={navigate} />;
        case "/officer/analytics":
          return <OfficerAnalytics onNavigate={navigate} />;
        case "/officer/advisory":
          return <LegalAdvisoryView onNavigate={navigate} />;
        case "/officer/dashboard":
        default:
          return <OfficerDashboard onNavigate={navigate} />;
      }
    }

    // Manufacturer Routes
    if (role === "manufacturer") {
      switch (currentPath) {
        case "/manufacturer/products":
          return <ManufacturerProducts onNavigate={navigate} />;
        case "/manufacturer/compliance":
          return <ManufacturerCompliance onNavigate={navigate} />;
        case "/manufacturer/violations":
          return <ManufacturerViolations onNavigate={navigate} />;
        case "/manufacturer/corrective-actions":
          return <ManufacturerCorrectiveActions onNavigate={navigate} />;
        case "/manufacturer/reports":
          return <ManufacturerReports onNavigate={navigate} />;
        case "/manufacturer/advisory":
          return <LegalAdvisoryView onNavigate={navigate} />;
        case "/manufacturer/dashboard":
        default:
          return <ManufacturerDashboard onNavigate={navigate} />;
      }
    }

    // Default fallback to UserDashboard if role is unexpected
    return <UserDashboard onNavigate={navigate} />;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "transparent" }}>
      {showWelcome && <WelcomeSplash user={user} onDismiss={() => setShowWelcome(false)} />}
      <Header currentPath={currentPath} onNavigate={navigate} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar currentPath={currentPath} onNavigate={navigate} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ display: "flex", flex: 1 }}>
        <main style={{ flex: 1, overflowY: "auto", minHeight: "calc(100vh - 61px)" }}>
          <ErrorBoundary>
            {renderView()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}
