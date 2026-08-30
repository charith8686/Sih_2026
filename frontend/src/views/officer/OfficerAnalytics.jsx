import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export const OfficerAnalytics = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/officer/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => setData(d));
  }, [token]);

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
          Statutory Compliance & Enforcement Analytics
        </h2>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
          Aggregated trends, non-compliance distributions, and inspection throughput.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "1.25rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" }}>
            Compliance Rate Distribution
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                <span style={{ color: "#047857" }}>Compliant Inspections</span>
                <span>{data?.stats?.compliant_products ?? 0}</span>
              </div>
              <div style={{ height: "12px", backgroundColor: "#e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ width: "67%", height: "100%", backgroundColor: "#047857" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                <span style={{ color: "#b91c1c" }}>Potential Non-Compliance</span>
                <span>{data?.stats?.non_compliant_products ?? 0}</span>
              </div>
              <div style={{ height: "12px", backgroundColor: "#e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ width: "33%", height: "100%", backgroundColor: "#b91c1c" }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "1.25rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" }}>
            Inspection Mode Breakdown
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                <span>📦 Physical Package Scans</span>
                <span>75%</span>
              </div>
              <div style={{ height: "12px", backgroundColor: "#e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ width: "75%", height: "100%", backgroundColor: "#1e3a8a" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                <span>🌐 E-Commerce Listings (R.6.10)</span>
                <span>25%</span>
              </div>
              <div style={{ height: "12px", backgroundColor: "#e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ width: "25%", height: "100%", backgroundColor: "#7c3aed" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};