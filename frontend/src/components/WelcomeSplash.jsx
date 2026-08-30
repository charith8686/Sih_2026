import React, { useState, useEffect } from "react";

export const WelcomeSplash = ({ user, onDismiss }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 3000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onDismiss]);

  const getRoleTheme = () => {
    switch (user?.role) {
      case "officer":
        return {
          icon: "🛡️",
          roleTitle: "Legal Metrology Enforcement Officer",
          roleDesc: "Full Statutory Enforcement Authority • PCR-2011 Jurisdiction",
          gradient: "linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)",
          accent: "#818cf8"
        };
      case "manufacturer":
        return {
          icon: "🏢",
          roleTitle: "Registered Packaging Facility",
          roleDesc: `${user?.company_name || "ABC Foods Pvt Ltd"} • Pre-Market Quality Center`,
          gradient: "linear-gradient(135deg, #064e3b 0%, #047857 100%)",
          accent: "#34d399"
        };
      case "user":
      default:
        return {
          icon: "👤",
          roleTitle: "Verified Consumer Redressal Account",
          roleDesc: "Packaged Commodity Verification • Consumer Redressal Desk",
          gradient: "linear-gradient(135deg, #1e40af 0%, #0369a1 100%)",
          accent: "#38bdf8"
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#070b14",
        backgroundImage: `
          radial-gradient(circle at 50% 40%, rgba(30, 58, 138, 0.45) 0%, rgba(7, 11, 20, 0.98) 75%),
          linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        animation: "fadeIn 0.3s ease-out"
      }}
    >
      {/* Central Holographic Welcome Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "600px",
          padding: "2.5rem 3rem",
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1.5px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.2)"
        }}
      >
        {/* Role Icon Orb */}
        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: theme.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "3rem",
            boxShadow: `0 0 35px ${theme.accent}, 0 0 0 4px #070b14, 0 0 0 6px ${theme.accent}`,
            marginBottom: "1.5rem"
          }}
        >
          {theme.icon}
        </div>

        {/* High-Contrast Crisp Welcome Greeting */}
        <h1
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "2.5rem",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            textShadow: "0 4px 16px rgba(0, 0, 0, 0.6)"
          }}
        >
          Welcome, {user?.name || "User"} 👋
        </h1>

        {/* Role Pill */}
        <div
          style={{
            display: "inline-block",
            fontSize: "0.85rem",
            fontWeight: 800,
            color: theme.accent,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            padding: "0.3rem 0.9rem",
            borderRadius: "999px",
            border: `1px solid ${theme.accent}`,
            marginBottom: "1rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase"
          }}
        >
          {theme.roleTitle}
        </div>

        <p style={{ margin: "0 0 2rem 0", fontSize: "0.95rem", color: "#cbd5e1", lineHeight: 1.45 }}>
          {theme.roleDesc}
        </p>

        {/* Enter Button CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={{
            padding: "0.75rem 2rem",
            background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.95rem",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(6, 182, 212, 0.35)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.15s ease"
          }}
        >
          <span>Enter Dashboard Hub</span>
          <span>→</span>
        </button>

        {/* 3-Second Progress Bar */}
        <div
          style={{
            width: "100%",
            maxWidth: "320px",
            height: "4px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "2px",
            marginTop: "1.75rem",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: theme.accent,
              boxShadow: `0 0 10px ${theme.accent}`,
              transition: "width 0.05s linear"
            }}
          />
        </div>

        <span style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "0.6rem" }}>
          Entering automatically in {Math.ceil((3000 - (progress / 100) * 3000) / 1000)}s (or click anywhere)
        </span>
      </div>
    </div>
  );
};
