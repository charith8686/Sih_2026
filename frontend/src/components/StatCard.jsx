import React from "react";

export const StatCard = ({
  title,
  value,
  subtitle = null,
  icon = "📊",
  badge = null,
  badgeType = "info", // info, success, warning, danger
  onClick = null,
  accentColor = "#1e3a8a",
  actionText = null
}) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case "success": return { bg: "#d1fae5", text: "#065f46" };
      case "warning": return { bg: "#fef3c7", text: "#92400e" };
      case "danger": return { bg: "#fee2e2", text: "#991b1b" };
      case "info":
      default:
        return { bg: "#eff6ff", text: "#1e40af" };
    }
  };

  const bStyle = getBadgeStyle();

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        padding: "1.25rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden"
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 16px -4px rgba(0, 0, 0, 0.1)";
          e.currentTarget.style.borderColor = accentColor;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
          e.currentTarget.style.borderColor = "#e2e8f0";
        }
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <div>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
            {title}
          </span>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", marginTop: "2px", lineHeight: 1.1 }}>
            {value}
          </div>
        </div>

        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem"
        }}>
          {icon}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
        {subtitle && (
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
            {subtitle}
          </span>
        )}
        {badge && (
          <span style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "0.15rem 0.5rem",
            borderRadius: "999px",
            backgroundColor: bStyle.bg,
            color: bStyle.text
          }}>
            {badge}
          </span>
        )}
        {actionText && (
          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: accentColor, display: "flex", alignItems: "center", gap: "2px" }}>
            {actionText} →
          </span>
        )}
      </div>
    </div>
  );
};
