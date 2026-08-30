import React from "react";
import { useAuth } from "../context/AuthContext";

export const Sidebar = ({ currentPath, onNavigate, isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || "user";

  if (!isOpen) return null;

  const getNavSections = () => {
    switch (role) {
      case "officer":
        return [
          {
            title: "Enforcement Authority",
            items: [
              { path: "/officer/dashboard", label: "Enforcement Dashboard", icon: "🏠" },
              { path: "/officer/complaints", label: "Complaints Triage", icon: "📋" },
              { path: "/officer/violations", label: "Violations & Notices", icon: "⚠️" },
              { path: "/officer/corrective-actions", label: "Remedy Reviews", icon: "⚖️" }
            ]
          },
          {
            title: "Auditing & Inspection",
            items: [
              { path: "/officer/scan", label: "Statutory OCR Scanner", icon: "🔍" },
              { path: "/officer/inspections", label: "Inspections (INS)", icon: "📑" },
              { path: "/officer/products", label: "Products Registry", icon: "📦" },
              { path: "/officer/analytics", label: "Analytics & Reports", icon: "📊" },
              { path: "/officer/advisory", label: "Legal Advisory", icon: "⚖️" }
            ]
          },
          {
            title: "System Alerts",
            items: [
              { path: "/notifications", label: "Notifications", icon: "🔔" }
            ]
          }
        ];
      case "manufacturer":
        return [
          {
            title: "Compliance Management",
            items: [
              { path: "/manufacturer/dashboard", label: "Company Dashboard", icon: "🏠" },
              { path: "/manufacturer/violations", label: "Notices & Violations", icon: "⚠️" },
              { path: "/manufacturer/corrective-actions", label: "Corrective Actions", icon: "🛠️" }
            ]
          },
          {
            title: "Packaging Operations",
            items: [
              { path: "/manufacturer/compliance", label: "Pre-Market Scanner", icon: "🔬" },
              { path: "/manufacturer/products", label: "My Products Catalog", icon: "📦" },
              { path: "/manufacturer/reports", label: "Compliance Summary", icon: "📊" },
              { path: "/manufacturer/advisory", label: "Legal Advisory", icon: "⚖️" }
            ]
          },
          {
            title: "System Alerts",
            items: [
              { path: "/notifications", label: "Notifications", icon: "🔔" }
            ]
          }
        ];
      case "user":
      default:
        return [
          {
            title: "Consumer Portal",
            items: [
              { path: "/user/dashboard", label: "Dashboard", icon: "🏠" },
              { path: "/user/scan", label: "Scan Package", icon: "📷" },
              { path: "/user/complaints", label: "My Complaints", icon: "📋" },
              { path: "/user/scans", label: "Scan History", icon: "📜" },
              { path: "/user/reports", label: "Consumer Advisory", icon: "💡" },
              { path: "/user/advisory", label: "Legal Advisory", icon: "⚖️" }
            ]
          },
          {
            title: "System Alerts",
            items: [
              { path: "/notifications", label: "Notifications", icon: "🔔" }
            ]
          }
        ];
    }
  };

  const sections = getNavSections();

  const handleItemClick = (path) => {
    onNavigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
          zIndex: 90,
          transition: "opacity 0.2s ease"
        }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "270px",
          backgroundColor: "#ffffff",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          animation: "slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: "1.1rem 1.25rem",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#f8fafc"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "#1e3a8a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.85rem"
            }}>
              LM
            </div>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#0f172a" }}>
              Navigation Menu
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              color: "#64748b",
              cursor: "pointer",
              padding: "0.2rem 0.5rem",
              borderRadius: "4px"
            }}
            title="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation Sections */}
        <div style={{ padding: "1.25rem 0.85rem", flex: 1, overflowY: "auto" }}>
          {sections.map((sec, sIdx) => (
            <div key={sIdx} style={{ marginBottom: "1.25rem" }}>
              <div style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "0 0.6rem 0.4rem 0.6rem"
              }}>
                {sec.title}
              </div>

              <nav style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                {sec.items.map((item) => {
                  const isExact = currentPath === item.path;
                  const isNested = item.path !== "/officer/dashboard" && item.path !== "/manufacturer/dashboard" && item.path !== "/user/dashboard" && currentPath.startsWith(item.path);
                  const isActive = isExact || isNested;

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleItemClick(item.path)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        width: "100%",
                        padding: "0.6rem 0.75rem",
                        fontSize: "0.85rem",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#1e3a8a" : "#475569",
                        backgroundColor: isActive ? "#eff6ff" : "transparent",
                        border: "none",
                        borderLeft: isActive ? "3px solid #1e3a8a" : "3px solid transparent",
                        borderRadius: "0 6px 6px 0",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "#f8fafc";
                          e.currentTarget.style.color = "#1e293b";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#475569";
                        }
                      }}
                    >
                      <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{item.icon}</span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: "0.9rem 1rem",
          borderTop: "1px solid #f1f5f9",
          backgroundColor: "#f8fafc"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#1e293b" }}>PCR-2011 Engine Active</span>
          </div>
          <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
            EasyOCR Neural OCR • 11 Rules Verified
          </div>
        </div>
      </aside>
    </>
  );
};
