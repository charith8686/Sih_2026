import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { CircularOrbitLayout } from "../../components/CircularOrbitLayout";

export const UserDashboard = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);

  const fetchDashboard = () => {
    fetch(`http://127.0.0.1:8000/api/user/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Error loading user dashboard:", err));
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const stats = data?.stats || {
    products_scanned: 0,
    compliant: 0,
    potential_non_compliance: 0,
    complaints_filed: 0
  };

  const portalItems = [
    {
      icon: "📷",
      title: "Scan Package",
      subtitle: "Instant Neural OCR Audit",
      badge: "11 Declarations",
      gradient: "linear-gradient(135deg, #0284c7 0%, #1e40af 100%)",
      accentColor: "#38bdf8",
      glowColor: "rgba(56, 189, 248, 0.65)",
      onClick: () => onNavigate("/user/scan")
    },
    {
      icon: "✍️",
      title: "File Grievance",
      subtitle: "Report Statutory Breach",
      count: stats.complaints_filed,
      badge: "Direct Notice",
      gradient: "linear-gradient(135deg, #ea580c 0%, #991b1b 100%)",
      accentColor: "#fb923c",
      glowColor: "rgba(251, 146, 60, 0.65)",
      onClick: () => onNavigate("/user/complaints")
    },
    {
      icon: "📜",
      title: "Scan History",
      subtitle: "My Audited Packages",
      count: stats.products_scanned,
      badge: `${stats.compliant} Verified`,
      gradient: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
      accentColor: "#34d399",
      glowColor: "rgba(52, 211, 153, 0.65)",
      onClick: () => onNavigate("/user/scans")
    },
    {
      icon: "💡",
      title: "Consumer Advisory",
      subtitle: "PCR-2011 Rights & Rules",
      badge: "Statutory Guide",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
      accentColor: "#a78bfa",
      glowColor: "rgba(167, 139, 250, 0.65)",
      onClick: () => onNavigate("/user/reports")
    },
    {
      icon: "⚖️",
      title: "Legal Advisory",
      subtitle: "Official Regulatory Basis",
      badge: "Acts & Rules",
      gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      accentColor: "#60a5fa",
      glowColor: "rgba(96, 165, 250, 0.65)",
      onClick: () => onNavigate("/user/advisory")
    },
    {
      icon: "🔔",
      title: "Alerts Center",
      subtitle: "Enforcement Status Updates",
      badge: "Live Feed",
      gradient: "linear-gradient(135deg, #0891b2 0%, #155e75 100%)",
      accentColor: "#22d3ee",
      glowColor: "rgba(34, 211, 238, 0.65)",
      onClick: () => onNavigate("/notifications")
    }
  ];

  return (
    <div style={{
      minHeight: "calc(100vh - 65px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem 1.5rem",
      boxSizing: "border-box"
    }}>
      {/* High-Tech Circular Orbit Hub */}
      <CircularOrbitLayout
        centerTitle="Consumer Portal"
        centerSubtitle="Legal Metrology"
        centerIcon="🏛️"
        items={portalItems}
      />
    </div>
  );
};