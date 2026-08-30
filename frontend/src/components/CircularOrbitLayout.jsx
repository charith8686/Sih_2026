import React, { useState } from "react";

export const CircularOrbitLayout = ({
  centerTitle = "Enforcement Hub",
  centerSubtitle = "Select an action",
  centerIcon = "⚡",
  centerColor = "#2563eb",
  items = []
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const radius = 230;
  const totalItems = items.length;

  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: "900px",
      height: "650px",
      margin: "0.5rem auto 1.5rem auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {/* Outer Glowing Orbital Track */}
      <div
        style={{
          position: "absolute",
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          borderRadius: "50%",
          border: "2px dashed rgba(56, 189, 248, 0.35)",
          boxShadow: "0 0 50px rgba(56, 189, 248, 0.15), inset 0 0 50px rgba(56, 189, 248, 0.08)",
          pointerEvents: "none",
          animation: "rotateSlow 75s linear infinite"
        }}
      />

      {/* Secondary Outer Radar Ring */}
      <div
        style={{
          position: "absolute",
          width: `${radius * 2 + 70}px`,
          height: `${radius * 2 + 70}px`,
          borderRadius: "50%",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          pointerEvents: "none"
        }}
      />

      {/* Inner Energy Field */}
      <div
        style={{
          position: "absolute",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 70%)",
          pointerEvents: "none"
        }}
      />

      {/* Central Cybernetic Reactor Core */}
      <div
        style={{
          position: "absolute",
          width: "165px",
          height: "165px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 40% 30%, #1e293b 0%, #0b1120 70%, #020617 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          textAlign: "center",
          boxShadow: "0 0 35px rgba(56, 189, 248, 0.35), inset 0 0 20px rgba(56, 189, 248, 0.2)",
          border: "2px solid rgba(56, 189, 248, 0.6)",
          zIndex: 10,
          padding: "1rem",
          boxSizing: "border-box",
          animation: "pulseGlow 4s ease-in-out infinite",
          transition: "all 0.3s ease"
        }}
      >
        <div style={{
          fontSize: "2.3rem",
          lineHeight: 1,
          marginBottom: "4px",
          filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))"
        }}>
          {hoveredIdx !== null ? items[hoveredIdx].icon : centerIcon}
        </div>
        <div style={{
          fontSize: "0.88rem",
          fontWeight: 900,
          letterSpacing: "0.02em",
          color: "#f8fafc",
          lineHeight: 1.15
        }}>
          {hoveredIdx !== null ? items[hoveredIdx].title : centerTitle}
        </div>
        <div style={{
          fontSize: "0.72rem",
          color: "#38bdf8",
          marginTop: "3px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em"
        }}>
          {hoveredIdx !== null ? items[hoveredIdx].badge || "Launch Tool →" : centerSubtitle}
        </div>
      </div>

      {/* Orbiting High-Tech Circular Action Cards */}
      {items.map((item, idx) => {
        const angle = (idx * (2 * Math.PI) / totalItems) - (Math.PI / 2);
        const x = Math.round(radius * Math.cos(angle));
        const y = Math.round(radius * Math.sin(angle));
        const isHovered = hoveredIdx === idx;

        return (
          <div
            key={idx}
            onClick={item.onClick}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              position: "absolute",
              transform: `translate(${x}px, ${y}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: isHovered ? 30 : 20,
              transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
          >
            {/* Circular Card Body */}
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                background: item.gradient || "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                textAlign: "center",
                padding: "0.8rem",
                boxSizing: "border-box",
                position: "relative",
                boxShadow: isHovered
                  ? `0 0 40px ${item.glowColor || "rgba(56, 189, 248, 0.7)"}, 0 0 0 4px #070b14, 0 0 0 7px ${item.accentColor || "#38bdf8"}`
                  : `0 10px 25px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.15)`,
                transform: isHovered ? "scale(1.15)" : "scale(1)",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }}
            >
              {/* Optional Count Badge */}
              {item.count !== null && item.count !== undefined && (
                <div
                  style={{
                    position: "absolute",
                    top: "1px",
                    right: "2px",
                    backgroundColor: item.count > 0 ? "#ef4444" : "#10b981",
                    color: "#ffffff",
                    fontSize: "0.72rem",
                    fontWeight: 900,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "999px",
                    border: "2px solid #070b14",
                    boxShadow: `0 0 10px ${item.count > 0 ? "rgba(239, 68, 68, 0.8)" : "rgba(16, 185, 129, 0.8)"}`
                  }}
                >
                  {item.count}
                </div>
              )}

              {/* Icon with Glowing Filter */}
              <div
                style={{
                  fontSize: "2.3rem",
                  lineHeight: 1,
                  marginBottom: "0.25rem",
                  transform: isHovered ? "scale(1.2) rotate(6deg)" : "scale(1)",
                  transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                }}
              >
                {item.icon}
              </div>

              {/* Action Title inside circle */}
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 900,
                  lineHeight: 1.15,
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                }}
              >
                {item.title}
              </div>
            </div>

            {/* Subtitle Label under the circle */}
            <div
              style={{
                marginTop: "0.65rem",
                fontSize: "0.76rem",
                fontWeight: 800,
                color: isHovered ? (item.accentColor || "#38bdf8") : "#94a3b8",
                textAlign: "center",
                maxWidth: "150px",
                lineHeight: 1.2,
                backgroundColor: isHovered ? "rgba(15, 23, 42, 0.8)" : "transparent",
                padding: isHovered ? "0.2rem 0.6rem" : "0",
                borderRadius: "999px",
                border: isHovered ? `1px solid ${item.accentColor || "#38bdf8"}` : "1px solid transparent",
                boxShadow: isHovered ? `0 0 12px ${item.glowColor || "rgba(56, 189, 248, 0.3)"}` : "none",
                transition: "all 0.2s ease"
              }}
            >
              {item.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
};
