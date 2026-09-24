import { API_BASE_URL } from "../../config";
﻿import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export const ManufacturerReports = () => {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [violations, setViolations] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API_BASE_URL}/api/manufacturer/products`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/manufacturer/violations`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/manufacturer/corrective-actions`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([prods, vios, acts]) => {
        setProducts(prods || []);
        setViolations(vios || []);
        setActions(acts || []);
      })
      .catch(err => console.error("Report fetch error:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const compliantCount = products.filter(p => p.compliance_status === "COMPLIANT").length;
  const nonCompliantCount = products.filter(p => p.compliance_status === "POTENTIAL_NON_COMPLIANCE").length;
  const openViolationsCount = violations.filter(v => v.status === "OPEN" || v.status === "UNDER_REVIEW").length;
  const resolvedViolationsCount = violations.filter(v => v.status === "RESOLVED").length;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header with Export Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
            Legal Metrology Statutory Compliance Dossier
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
            Official compliance report generated for {user?.company_name || "ABC Foods Pvt Ltd"} under PCR 2011.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            padding: "0.6rem 1.25rem",
            backgroundColor: "#1e3a8a",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}
        >
          <span>📄</span>
          <span>Export PDF / Print Dossier</span>
        </button>
      </div>

      {/* Printable Report Document */}
      <div id="compliance-dossier" style={{
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        padding: "2rem",
        border: "1px solid #cbd5e1",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
      }}>
        {/* Certificate Header Banner */}
        <div style={{
          borderBottom: "2px solid #1e3a8a",
          paddingBottom: "1rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#1e3a8a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Government of India • Ministry of Consumer Affairs
            </div>
            <h1 style={{ margin: "0.25rem 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
              Packaging Statutory Audit & Clearance Dossier
            </h1>
            <div style={{ fontSize: "0.8rem", color: "#475569" }}>
              Legal Metrology (Packaged Commodities) Rules, 2011 (as amended)
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "0.78rem", color: "#64748b" }}>
            <div><strong>Report Ref:</strong> LM-REP-{new Date().getFullYear()}-{user?.id || 1}</div>
            <div><strong>Date Generated:</strong> {new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div><strong>Status:</strong> Official Audit Copy</div>
          </div>
        </div>

        {/* Company & Executive Summary */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.25rem",
          backgroundColor: "#f8fafc",
          padding: "1.25rem",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          marginBottom: "1.5rem"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Registered Unit Profile</div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{user?.company_name || "ABC Foods Pvt Ltd"}</div>
            <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "4px" }}>
              Authorized Compliance Officer: <strong>{user?.name || "Rajesh Gupta"}</strong><br />
              Account Email: {user?.email || "manufacturer@abcfoods.com"}<br />
              Enforcement Framework: PCR-2011 Mandatory Standards
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Audit Metrics Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.82rem" }}>
              <div>📦 Total Catalog SKUs: <strong>{products.length}</strong></div>
              <div>✅ PCR Compliant: <strong style={{ color: "#059669" }}>{compliantCount}</strong></div>
              <div>⚠️ Active Notices: <strong style={{ color: "#dc2626" }}>{openViolationsCount}</strong></div>
              <div>🛠️ Remedies Filed: <strong style={{ color: "#2563eb" }}>{actions.length}</strong></div>
            </div>
          </div>
        </div>

        {/* Section 1: Registered SKUs & Pre-Market Compliance Status */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.4rem" }}>
            1. Registered Product Catalog & Compliance Status
          </h3>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
            <thead style={{ backgroundColor: "#f1f5f9", color: "#334155" }}>
              <tr>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>SKU Code</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Product Name</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Category</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Net Qty</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>MRP</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Statutory Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.6rem 0.75rem", fontWeight: 700, color: "#1e3a8a" }}>{p.product_code}</td>
                    <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600, color: "#0f172a" }}>{p.name}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#475569" }}>{p.category}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#334155" }}>{p.pack_size}</td>
                    <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>₹{p.mrp?.toFixed(2) || "0.00"}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.4rem",
                        borderRadius: "4px",
                        backgroundColor: p.compliance_status === "COMPLIANT" ? "#d1fae5" : "#fee2e2",
                        color: p.compliance_status === "COMPLIANT" ? "#065f46" : "#991b1b"
                      }}>
                        {p.compliance_status || "COMPLIANT"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8" }}>
                    No product SKUs registered yet in catalog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 2: Statutory Violations & Show Cause History */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.4rem" }}>
            2. Statutory Show Cause Notices & Enforcement History
          </h3>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
            <thead style={{ backgroundColor: "#f1f5f9", color: "#334155" }}>
              <tr>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Notice Ref</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Product</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Rule Breached</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Severity</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Statutory Finding</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Enforcement Status</th>
              </tr>
            </thead>
            <tbody>
              {violations.length > 0 ? (
                violations.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.6rem 0.75rem", fontWeight: 700, color: "#b91c1c" }}>{v.violation_code}</td>
                    <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600, color: "#0f172a" }}>{v.product_name}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#1e3a8a", fontWeight: 600 }}>{v.rule_id} ({v.rule_name})</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>{v.severity}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#475569" }}>{v.reason}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.4rem",
                        borderRadius: "4px",
                        backgroundColor: v.status === "RESOLVED" ? "#d1fae5" : "#fee2e2",
                        color: v.status === "RESOLVED" ? "#065f46" : "#991b1b"
                      }}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8" }}>
                    No statutory violations on record. Full compliance standing maintained.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 3: Corrective Actions & Resolution Log */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.4rem" }}>
            3. Corrective Action Filings & Officer Decisions
          </h3>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
            <thead style={{ backgroundColor: "#f1f5f9", color: "#334155" }}>
              <tr>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Remedy Code</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Notice Reference</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Remediation Summary</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Officer Remarks</th>
                <th style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {actions.length > 0 ? (
                actions.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.6rem 0.75rem", fontWeight: 700, color: "#1e3a8a" }}>{a.ca_code}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#b91c1c", fontWeight: 600 }}>{a.violation_code}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#334155" }}>{a.what_was_changed}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: "#475569" }}>{a.officer_review_notes || "Pending Review"}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.4rem",
                        borderRadius: "4px",
                        backgroundColor: a.status === "APPROVED" ? "#d1fae5" : a.status === "DENIED" ? "#fee2e2" : "#eff6ff",
                        color: a.status === "APPROVED" ? "#065f46" : a.status === "DENIED" ? "#991b1b" : "#1e40af"
                      }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8" }}>
                    No corrective action filings logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Official Statutory Attestation Signature Footer */}
        <div style={{
          borderTop: "2px solid #e2e8f0",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end"
        }}>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", maxWidth: "420px", lineHeight: 1.4 }}>
              This document is an electronic extract generated from the Legal Metrology Compliance & Verification System. Certified valid under the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011.
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "160px", borderBottom: "1px solid #334155", marginBottom: "4px" }} />
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f172a" }}>Authorized Signatory</div>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Legal Metrology Enforcement Directorate</div>
          </div>
        </div>
      </div>
    </div>
  );
};