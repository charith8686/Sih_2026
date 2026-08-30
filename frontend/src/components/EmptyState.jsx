import React from "react";

export const EmptyState = ({
  icon = "📂",
  title = "No records found",
  description = "No items match your criteria. Get started by taking the recommended action below.",
  actionText = null,
  onAction = null,
  secondaryActionText = null,
  onSecondaryAction = null
}) => {
  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      padding: "3rem 2rem",
      textAlign: "center",
      border: "1px dashed #cbd5e1",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: "1rem 0"
    }}>
      <div style={{
        width: "56px",
        height: "56px",
        borderRadius: "28px",
        backgroundColor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.75rem",
        marginBottom: "1rem"
      }}>
        {icon}
      </div>

      <h3 style={{ margin: "0 0 0.4rem 0", fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
        {title}
      </h3>

      <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.85rem", color: "#64748b", maxWidth: "440px", lineHeight: 1.45 }}>
        {description}
      </p>

      {(actionText || secondaryActionText) && (
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {actionText && (
            <button
              onClick={onAction}
              style={{
                padding: "0.55rem 1.25rem",
                backgroundColor: "#1e3a8a",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "all 0.15s ease"
              }}
            >
              {actionText}
            </button>
          )}

          {secondaryActionText && (
            <button
              onClick={onSecondaryAction}
              style={{
                padding: "0.55rem 1rem",
                backgroundColor: "#ffffff",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
