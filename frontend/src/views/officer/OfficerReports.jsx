import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export const OfficerReports = () => {
  const { token } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/officer/inspections`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => {
        setInspections(d);
        if (d.length > 0) setSelected(d[0]);
      });
  }, [token]);

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
            Statutory Inspection Reports & Certificates
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
            Official audit summaries formatted for legal recordkeeping and notice issuance.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            padding: "0.55rem 1rem",
            backgroundColor: "#1e3a8a",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          🖨️ Print / Export PDF
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
        {/* Inspection Selector List */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          padding: "1rem",
          maxHeight: "75vh",
          overflowY: "auto"
        }}>
          <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", fontWeight: 700, color: "#1e293b" }}>
            Select Inspection Record
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {inspections.map((ins) => (
              <button
                key={ins.id}
                onClick={() => setSelected(ins)}
                style={{
                  padding: "0.75rem",
                  backgroundColor: selected?.id === ins.id ? "#eff6ff" : "#f8fafc",
                  border: `1px solid ${selected?.id === ins.id ? "#bfdbfe" : "#e2e8f0"}`,
                  borderRadius: "6px",
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#1e3a8a", fontSize: "0.82rem" }}>
                  <span>{ins.inspection_code}</span>
                  <span style={{
                    fontSize: "0.68rem",
                    color: ins.compliance_status === "COMPLIANT" ? "#065f46" : "#991b1b"
                  }}>
                    {ins.compliance_status}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: 600, marginTop: "0.2rem" }}>
                  {ins.product_name}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  {ins.manufacturer_name} • {ins.created_at}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Printable Report Document Card */}
        {selected ? (
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            padding: "2rem",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
          }}>
            {/* Report Header */}
            <div style={{ borderBottom: "2px solid #1e3a8a", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#1e3a8a", letterSpacing: "0.05em" }}>
                    GOVERNMENT OF INDIA • DEPARTMENT OF CONSUMER AFFAIRS
                  </div>
                  <h1 style={{ margin: "0.25rem 0", fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                    Legal Metrology Inspection & Compliance Report
                  </h1>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Enforcement Framework: Packaged Commodities Rules, 2011 (As Amended)
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e3a8a" }}>{selected.inspection_code}</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Date: {selected.created_at}</div>
                </div>
              </div>
            </div>

            {/* Target Particulars */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "6px", marginBottom: "1.5rem", fontSize: "0.82rem" }}>
              <div><strong>Commodity:</strong> {selected.product_name}</div>
              <div><strong>Manufacturer / Packer:</strong> {selected.manufacturer_name}</div>
              <div><strong>Inspecting Officer:</strong> {selected.officer_name || "Senior Metrology Inspector"}</div>
              <div><strong>Audit Mode:</strong> {selected.inspection_type === "physical_package" ? "Physical Package Panel" : "E-Commerce Digital Listing"}</div>
            </div>

            {/* Statutory Outcome Banner */}
            <div style={{
              padding: "1rem",
              backgroundColor: selected.compliance_status === "COMPLIANT" ? "#ecfdf5" : "#fef2f2",
              border: `1px solid ${selected.compliance_status === "COMPLIANT" ? "#a7f3d0" : "#fecaca"}`,
              borderRadius: "6px",
              marginBottom: "1.5rem"
            }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>OVERALL AUDIT DETERMINATION:</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 900, color: selected.compliance_status === "COMPLIANT" ? "#065f46" : "#991b1b" }}>
                {selected.compliance_status.replace("_", " ")}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "0.25rem" }}>
                Violations Detected: <strong>{selected.violations_count}</strong>
              </div>
            </div>

            {/* Inspector Observations */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.88rem", fontWeight: 700, color: "#1e293b" }}>
                Official Findings & Observations:
              </h4>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#334155", lineHeight: 1.5, backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                {selected.officer_remarks || "No specific inspector remarks attached."}
              </p>
            </div>

            {/* Legal Disclaimer */}
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
              <strong>AI-Assisted Decision Support:</strong> This report represents digital computer vision analysis and optical screening under Legal Metrology Packaged Commodities Rules 2011. Final statutory notices and penalties are subject to review by the competent authority.
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
            Select an inspection from the left to view the report.
          </div>
        )}
      </div>
    </div>
  );
};