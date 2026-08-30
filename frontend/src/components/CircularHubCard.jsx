import React, { useState } from "react";

export const CircularHubCard = ({
  icon = "⚡",
  title = "Feature",
  subtitle = "Quick Action",
  count = null,
  badge = null,
  gradient = "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  accentColor = "#2563eb",
  glowColor = "rgba(37, 99, 235, 0.35)",
  onClick = () => {}
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        padding: "0.75rem",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
      }}
    >
      {/* Outer Orbit / Circle Hub */}
      <div
        style={{
          width: "165px",
          height: "165px",
          borderRadius: "50%",
          background: gradient,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxShadow: hovered
            ? `0 16px 32px -6px ${glowColor}, 0 0 0 4px #ffffff, 0 0 0 7px ${accentColor}`
            : `0 8px 20px -4px rgba(0, 0, 0, 0.12), 0 0 0 2px rgba(255, 255, 255, 0.8)`,
          transform: hovered ? "translateY(-6px) scale(1.06)" : "translateY(0) scale(1)",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          color: "#ffffff",
          textAlign: "center",
          padding: "1rem",
          boxSizing: "border-box"
        }}
      >
        {/* Pulsing Count Badge if present */}
        {count !== null && count !== undefined && (
          <div
            style={{
              position: "absolute",
              top: "-2px",
              right: "4px",
              backgroundColor: count > 0 ? "#ef4444" : "#10b981",
              color: "#ffffff",
              fontSize: "0.75rem",
              fontWeight: 900,
              padding: "0.2rem 0.55rem",
              borderRadius: "999px",
              border: "2px solid #ffffff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              transform: hovered ? "scale(1.15)" : "scale(1)",
              transition: "transform 0.2s ease"
            }}
          >
            {count}
          </div>
        )}

        {badge && (
          <div
            style={{
              position: "absolute",
              bottom: "-4px",
              backgroundColor: "#ffffff",
              color: accentColor,
              fontSize: "0.68rem",
              fontWeight: 800,
              padding: "0.15rem 0.55rem",
              borderRadius: "999px",
              border: `1.5px solid ${accentColor}`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap"
            }}
          >
            {badge}
          </div>
        )}

        {/* Icon with float */}
        <div
          style={{
            fontSize: "2.5rem",
            lineHeight: 1,
            marginBottom: "0.35rem",
            transform: hovered ? "scale(1.2) rotate(4deg)" : "scale(1) rotate(0deg)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}
        >
          {icon}
        </div>

        {/* Action Title inside circle */}
        <div
          style={{
            fontSize: "0.85rem",
            fontWeight: 800,
            lineHeight: 1.15,
            textShadow: "0 1px 3px rgba(0,0,0,0.25)",
            maxWidth: "130px"
          }}
        >
          {title}
        </div>
      </div>

      {/* Subtitle / Description beneath circle */}
      <div
        style={{
          marginTop: "0.85rem",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: hovered ? accentColor : "#475569",
          textAlign: "center",
          maxWidth: "150px",
          lineHeight: 1.25,
          transition: "color 0.2s ease"
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};
