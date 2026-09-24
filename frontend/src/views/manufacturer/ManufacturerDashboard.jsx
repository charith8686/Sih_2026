import { API_BASE_URL } from "../../config";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { CircularOrbitLayout } from "../../components/CircularOrbitLayout";

export const ManufacturerDashboard = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);

  const fetchDashboard = () => {
    fetch(`${API_BASE_URL}/api/manufacturer/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Error loading manufacturer dashboard:", err));
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const stats = data?.stats || {
    registered_products: 0,
    open_violations: 0,
    violations_under_review: 0,
    resolved_violations: 0,
    corrective_actions_pending: 0
  };

  const portalItems = [
    {
      icon: "🔬",
      title: "Pre-Market Scan",
      subtitle: "Label & Cylinder Audit",
      badge: "11 Declarations",
      gradient: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
      accentColor: "#34d399",
      glowColor: "rgba(52, 211, 153, 0.65)",
      onClick: () => onNavigate("/manufacturer/compliance")
    },
    {
      icon: "⚠️",
      title: "Show Cause Notices",
      subtitle: "Statutory Inquiries",
      count: stats.open_violations,
      badge: "Response Due",
      gradient: "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)",
      accentColor: "#f87171",
      glowColor: "rgba(248, 113, 113, 0.65)",
      onClick: () => onNavigate("/manufacturer/violations")
    },
    {
      icon: "🛠️",
      title: "Remedy Proofs",
      subtitle: "Corrective Action Filings",
      count: stats.corrective_actions_pending,
      badge: "Under Review",
      gradient: "linear-gradient(135deg, #0284c7 0%, #1e40af 100%)",
      accentColor: "#38bdf8",
      glowColor: "rgba(56, 189, 248, 0.65)",
      onClick: () => onNavigate("/manufacturer/corrective-actions")
    },
    {
      icon: "📦",
      title: "Products Catalog",
      subtitle: "Company SKU Registry",
      count: stats.registered_products,
      badge: "Registered SKUs",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
      accentColor: "#a78bfa",
      glowColor: "rgba(167, 139, 250, 0.65)",
      onClick: () => onNavigate("/manufacturer/products")
    },
    {
      icon: "📊",
      title: "Compliance Dossier",
      subtitle: "Audits & Export PDFs",
      badge: `${stats.resolved_violations} Resolved`,
      gradient: "linear-gradient(135deg, #0891b2 0%, #155e75 100%)",
      accentColor: "#22d3ee",
      glowColor: "rgba(34, 211, 238, 0.65)",
      onClick: () => onNavigate("/manufacturer/reports")
    },
    {
      icon: "⚖️",
      title: "Legal Advisory",
      subtitle: "Pre-Market Legal Rules",
      badge: "PCR-2011 Guidance",
      gradient: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
      accentColor: "#34d399",
      glowColor: "rgba(52, 211, 153, 0.65)",
      onClick: () => onNavigate("/manufacturer/advisory")
    },
    {
      icon: "🔔",
      title: "Alerts Center",
      subtitle: "Officer Directives",
      badge: "Live Feed",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
      accentColor: "#fcd34d",
      glowColor: "rgba(252, 211, 77, 0.65)",
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
        centerTitle="Facility Portal"
        centerSubtitle="PCR-2011 Compliance"
        centerIcon="🏭"
        items={portalItems}
      />
    </div>
  );
};