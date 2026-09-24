import { API_BASE_URL } from "../../config";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { CircularOrbitLayout } from "../../components/CircularOrbitLayout";

export const OfficerDashboard = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);

  const fetchDashboard = () => {
    fetch(`${API_BASE_URL}/api/officer/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Error loading officer dashboard:", err));
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const stats = data?.stats || {
    pending_complaints: 0,
    open_violations: 0,
    corrective_actions_pending: 0,
    total_inspections: 0
  };

  const portalItems = [
    {
      icon: "📬",
      title: "Grievances Triage",
      subtitle: "Verify Consumer Reports",
      count: stats.pending_complaints,
      badge: "Issue Notices",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
      accentColor: "#fcd34d",
      glowColor: "rgba(252, 211, 77, 0.65)",
      onClick: () => onNavigate("/officer/complaints")
    },
    {
      icon: "⚖️",
      title: "Remedy Reviews",
      subtitle: "Artwork Proof Decisions",
      count: stats.corrective_actions_pending,
      badge: "Approve / Deny",
      gradient: "linear-gradient(135deg, #0284c7 0%, #1e40af 100%)",
      accentColor: "#38bdf8",
      glowColor: "rgba(56, 189, 248, 0.65)",
      onClick: () => onNavigate("/officer/corrective-actions")
    },
    {
      icon: "⚠️",
      title: "Show Cause Notices",
      subtitle: "Active Violations Registry",
      count: stats.open_violations,
      badge: "Compounding",
      gradient: "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)",
      accentColor: "#f87171",
      glowColor: "rgba(248, 113, 113, 0.65)",
      onClick: () => onNavigate("/officer/violations")
    },
    {
      icon: "🔍",
      title: "OCR Scanner",
      subtitle: "Statutory Inspector Engine",
      badge: "11 Rules",
      gradient: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
      accentColor: "#34d399",
      glowColor: "rgba(52, 211, 153, 0.65)",
      onClick: () => onNavigate("/officer/scan")
    },
    {
      icon: "📑",
      title: "Inspections (INS)",
      subtitle: "Audit Registry Logs",
      count: stats.total_inspections,
      badge: "Official Logs",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
      accentColor: "#a78bfa",
      glowColor: "rgba(167, 139, 250, 0.65)",
      onClick: () => onNavigate("/officer/inspections")
    },
    {
      icon: "📊",
      title: "Analytics & KPIs",
      subtitle: "PCR-2011 Compliance Trends",
      badge: "Live Reports",
      gradient: "linear-gradient(135deg, #0891b2 0%, #155e75 100%)",
      accentColor: "#22d3ee",
      glowColor: "rgba(34, 211, 238, 0.65)",
      onClick: () => onNavigate("/officer/analytics")
    },
    {
      icon: "⚖️",
      title: "Legal Advisory",
      subtitle: "Statutory Reference Library",
      badge: "India Code & DCA",
      gradient: "linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%)",
      accentColor: "#818cf8",
      glowColor: "rgba(129, 140, 248, 0.65)",
      onClick: () => onNavigate("/officer/advisory")
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
        centerTitle="Enforcement Authority"
        centerSubtitle="Legal Metrology"
        centerIcon="⚖️"
        items={portalItems}
      />
    </div>
  );
};