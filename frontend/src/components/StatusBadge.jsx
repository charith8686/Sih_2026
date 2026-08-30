import React from "react";

export const StatusBadge = ({ status, size = "md" }) => {
  const norm = String(status || "UNKNOWN").toUpperCase().replace(/ /g, "_");

  let config = {
    bg: "#f1f5f9",
    text: "#475569",
    border: "#cbd5e1",
    icon: "⚪",
    label: norm.replace(/_/g, " ")
  };

  switch (norm) {
    // COMPLIANT / APPROVED / RESOLVED -> Green
    case "COMPLIANT":
      config = { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0", icon: "✓", label: "Compliant" };
      break;
    case "APPROVED":
      config = { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0", icon: "✓", label: "Approved" };
      break;
    case "RESOLVED":
      config = { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0", icon: "✓", label: "Resolved" };
      break;
    case "COMPLETED":
      config = { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0", icon: "✓", label: "Completed" };
      break;

    // POTENTIAL_NON_COMPLIANCE / REVISION_REQUIRED -> Amber
    case "POTENTIAL_NON_COMPLIANCE":
      config = { bg: "#fffbeb", text: "#92400e", border: "#fde68a", icon: "⚠", label: "Potential Non-Compliance" };
      break;
    case "REVISION_REQUIRED":
    case "REQUEST_REVISION":
      config = { bg: "#fffbeb", text: "#92400e", border: "#fde68a", icon: "🔄", label: "Revision Required" };
      break;
    case "REVIEW_REQUIRED":
      config = { bg: "#fffbeb", text: "#92400e", border: "#fde68a", icon: "🔍", label: "Review Required" };
      break;

    // OPEN / ESCALATED / VIOLATION -> Red
    case "OPEN":
      config = { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: "🔴", label: "Notice Open" };
      break;
    case "ESCALATED":
      config = { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff", icon: "🚨", label: "Escalated" };
      break;
    case "VIOLATION":
    case "VIOLATION_CREATED":
      config = { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: "⚠️", label: "Violation Notice" };
      break;
    case "DENIED":
      config = { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: "✕", label: "Denied" };
      break;

    // UNDER_REVIEW / SUBMITTED / PENDING_OFFICER_REVIEW -> Blue
    case "UNDER_REVIEW":
      config = { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", icon: "⏱️", label: "Under Review" };
      break;
    case "SUBMITTED":
      config = { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", icon: "📋", label: "Submitted" };
      break;
    case "PENDING_OFFICER_REVIEW":
      config = { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", icon: "⏳", label: "Pending Officer Review" };
      break;
    case "VERIFIED":
      config = { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", icon: "🔍", label: "Verified" };
      break;

    // REJECTED / CLOSED / NOT_APPLICABLE -> Gray
    case "REJECTED":
      config = { bg: "#f8fafc", text: "#475569", border: "#cbd5e1", icon: "✕", label: "Rejected" };
      break;
    case "CLOSED":
      config = { bg: "#f8fafc", text: "#475569", border: "#cbd5e1", icon: "🔒", label: "Closed" };
      break;
    case "NOT_APPLICABLE":
      config = { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0", icon: "—", label: "N/A" };
      break;
    default:
      config = { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1", icon: "•", label: norm.replace(/_/g, " ") };
  }

  const isSmall = size === "sm";
  const isLarge = size === "lg";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? "0.25rem" : "0.35rem",
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        borderRadius: "999px",
        padding: isSmall ? "0.15rem 0.45rem" : isLarge ? "0.35rem 0.85rem" : "0.25rem 0.6rem",
        fontSize: isSmall ? "0.68rem" : isLarge ? "0.85rem" : "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap"
      }}
    >
      <span style={{ fontSize: isSmall ? "0.65rem" : "0.75rem", lineHeight: 1 }}>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};
