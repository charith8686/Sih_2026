import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const DEMO_ACCOUNTS = {
  user: {
    email: "user@demo.com",
    password: "User@123",
    role: "user",
    title: "Consumer / Public User",
    desc: "Verify packaged commodity declarations and file complaints."
  },
  officer: {
    email: "officer@lm.gov.in",
    password: "Officer@123",
    role: "officer",
    title: "Legal Metrology Inspector",
    desc: "Conduct statutory inspections, audit OCR evidence, and manage violations."
  },
  manufacturer: {
    email: "manufacturer@abcfoods.com",
    password: "Manufacturer@123",
    role: "manufacturer",
    title: "ABC Foods Pvt Ltd",
    desc: "Perform pre-market label checks and submit corrective action proof."
  }
};

export const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState("user");
  const [email, setEmail] = useState("user@demo.com");
  const [password, setPassword] = useState("User@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword(DEMO_ACCOUNTS[role].password);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password, selectedRole);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      backgroundColor: "#f8fafc"
    }}>
      {/* Left Panel: Information & Branding */}
      <div style={{
        flex: "1 1 50%",
        backgroundColor: "#1e3a8a",
        backgroundImage: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
        color: "#ffffff",
        padding: "3.5rem 3rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "1.4rem"
            }}>
              LM
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Legal Metrology Compliance System
              </h1>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#93c5fd" }}>
                Packaged Commodities Rules (PCR), 2011
              </p>
            </div>
          </div>

          <div style={{
            padding: "0.8rem 1rem",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            marginBottom: "2rem"
          }}>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#e2e8f0", lineHeight: 1.4 }}>
              Statutory verification platform for the 11 mandatory Legal Metrology declaration categories (LM-01 to LM-11) across physical packaging and digital e-commerce listings.
            </p>
          </div>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#f8fafc" }}>
            Stakeholder Capabilities:
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.8rem" }}>
              <span style={{ fontSize: "1.3rem" }}>👤</span>
              <div>
                <strong style={{ fontSize: "0.9rem", color: "#bfdbfe" }}>Consumer Portal:</strong>
                <p style={{ margin: "0.15rem 0 0 0", fontSize: "0.8rem", color: "#cbd5e1" }}>
                  Instant packaging verification, simplified compliance checklist, and direct complaint filing (LM-CMP).
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.8rem" }}>
              <span style={{ fontSize: "1.3rem" }}>🛡️</span>
              <div>
                <strong style={{ fontSize: "0.9rem", color: "#bfdbfe" }}>Enforcement Officer:</strong>
                <p style={{ margin: "0.15rem 0 0 0", fontSize: "0.8rem", color: "#cbd5e1" }}>
                  Full OCR bounding box evidence, rule-by-rule statutory citations, violation severity triage, and inspection reports.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.8rem" }}>
              <span style={{ fontSize: "1.3rem" }}>🏢</span>
              <div>
                <strong style={{ fontSize: "0.9rem", color: "#bfdbfe" }}>Manufacturer (ABC Foods):</strong>
                <p style={{ margin: "0.15rem 0 0 0", fontSize: "0.8rem", color: "#cbd5e1" }}>
                  Pre-market label compliance screening, isolated company product catalog, and corrective action workflows.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
          Decision Support System • Prototype Rule Set PCR-2011-v1.0 • Department of Consumer Affairs
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div style={{
        flex: "1 1 50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "2.5rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{ marginBottom: "1.8rem" }}>
            <h2 style={{ margin: "0 0 0.4rem 0", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
              Sign In to Portal
            </h2>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              Select your stakeholder role to populate demo credentials
            </p>
          </div>

          {/* 1-Click Role Selector Tabs */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0.4rem",
            backgroundColor: "#f1f5f9",
            padding: "0.3rem",
            borderRadius: "8px",
            marginBottom: "1.5rem"
          }}>
            {[
              { id: "user", label: "Consumer", icon: "👤" },
              { id: "officer", label: "Officer", icon: "🛡️" },
              { id: "manufacturer", label: "Manufacturer", icon: "🏢" }
            ].map((tab) => {
              const isSelected = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectRole(tab.id)}
                  style={{
                    padding: "0.55rem 0.4rem",
                    fontSize: "0.78rem",
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "#1e3a8a" : "#64748b",
                    backgroundColor: isSelected ? "#ffffff" : "transparent",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.2rem",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Role Info Card */}
          <div style={{
            padding: "0.75rem",
            backgroundColor: "#eff6ff",
            borderRadius: "6px",
            border: "1px solid #bfdbfe",
            marginBottom: "1.5rem",
            fontSize: "0.8rem",
            color: "#1e3a8a"
          }}>
            <strong>{DEMO_ACCOUNTS[selectedRole].title}</strong>
            <p style={{ margin: "0.2rem 0 0 0", color: "#3b82f6" }}>
              {DEMO_ACCOUNTS[selectedRole].desc}
            </p>
          </div>

          {error && (
            <div style={{
              padding: "0.75rem",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              color: "#b91c1c",
              fontSize: "0.82rem",
              marginBottom: "1.2rem"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "0.3rem" }}>
                Official / User Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.8rem",
                  fontSize: "0.88rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: "0.3rem" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.8rem",
                  fontSize: "0.88rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.5rem",
                width: "100%",
                padding: "0.75rem",
                backgroundColor: loading ? "#93c5fd" : "#1e3a8a",
                color: "#ffffff",
                fontSize: "0.9rem",
                fontWeight: 700,
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.15s ease"
              }}
            >
              {loading ? "Authenticating..." : `Sign In as ${selectedRole.toUpperCase()}`}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => handleSelectRole(selectedRole)}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              Reset to Demo Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
