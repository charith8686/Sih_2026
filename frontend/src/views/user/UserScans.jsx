import { API_BASE_URL } from "../../config";
import { resolveImageUrl } from "../../utils/imageUrl";
﻿import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";

export const UserScans = ({ onNavigate }) => {
  const { token } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);
  const [msg, setMsg] = useState(null);

  const fetchScans = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/user/scans`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setScans(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScans();
  }, [token]);

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Delete scan record for "${filename || "Package"}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/scans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMsg({ type: "success", text: `✓ Scan record deleted successfully.` });
        fetchScans();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Failed to delete scan record.");
      }
    } catch (err) {
      alert("Failed to delete scan record.");
    }
  };

  

  const formatDateOnly = (dateStr) => {
    if (!dateStr) return "30 Aug 2026";
    // If contains comma (e.g. "30 Aug 2026, 02:16"), take the part before comma
    if (dateStr.includes(",")) {
      return dateStr.split(",")[0].trim();
    }
    return dateStr;
  };

        

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: "rgba(56, 189, 248, 0.15)", padding: "0.25rem 0.65rem", borderRadius: "999px", marginBottom: "0.3rem" }}>
            <span>📜</span>
            <span>Historical Compliance Audit Logs</span>
          </div>
          <h2 style={{ margin: "0.1rem 0", fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
            My Scan History
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
            Chronological log of packaged commodity scans audited under PCR-2011.
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate("/user/scan")}
          style={{
            padding: "0.65rem 1.3rem",
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.86rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 15px rgba(5, 150, 105, 0.4)"
          }}
        >
          <span>📷</span>
          <span>New Scan</span>
        </button>
      </div>

      {msg && (
        <div style={{
          padding: "0.85rem 1.25rem",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          border: "1.5px solid #10b981",
          borderRadius: "8px",
          color: "#34d399",
          fontSize: "0.85rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>{msg.text}</div>
          <button onClick={() => setMsg(null)} style={{ background: "none", border: "none", color: "#34d399", fontSize: "1rem", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Scans Table */}
      <div style={{
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(12px)",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.86rem" }}>
          <thead style={{ backgroundColor: "rgba(7, 11, 20, 0.8)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "#94a3b8" }}>
            <tr>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Scan Date</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Packaging Filename</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Compliance Finding</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Processing Time</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scans.length > 0 ? (
              scans.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", transition: "background 0.15s ease" }}>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#f8fafc", fontWeight: 600 }}>
                    {formatDateOnly(s.created_at || s.date)}
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#38bdf8", fontWeight: 600 }}>
                    {s.filename}
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <StatusBadge status={s.compliance_status || "POTENTIAL_NON_COMPLIANCE"} size="sm" />
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#94a3b8" }}>
                    {s.processing_time_seconds || "0.0"}s
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => setSelectedScan(s)}
                        style={{
                          padding: "0.4rem 0.85rem",
                          backgroundColor: "rgba(56, 189, 248, 0.15)",
                          color: "#38bdf8",
                          border: "1px solid rgba(56, 189, 248, 0.3)",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        View Findings
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.filename)}
                        style={{
                          padding: "0.4rem 0.65rem",
                          backgroundColor: "rgba(239, 68, 68, 0.15)",
                          color: "#f87171",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                        title="Delete Scan Record"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: "2rem" }}>
                  <EmptyState
                    icon="📷"
                    title="No scan records found"
                    description="Perform your first statutory package scan to populate your audit history."
                    actionText="Scan Package Now"
                    onAction={() => onNavigate && onNavigate("/user/scan")}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedScan && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(7, 11, 20, 0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: "#0f172a",
            borderRadius: "16px",
            width: "580px",
            maxWidth: "94vw",
            maxHeight: "88vh",
            overflowY: "auto",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8), 0 0 35px rgba(56, 189, 248, 0.2)",
            border: "1.5px solid rgba(56, 189, 248, 0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase" }}>
                  Audited Package Record
                </div>
                <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.2rem", fontWeight: 900, color: "#ffffff" }}>
                  {selectedScan.filename}
                </h3>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  fontSize: "1.1rem",
                  color: "#94a3b8",
                  cursor: "pointer",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            </div>

            {selectedScan.annotated_image_url && (
              <div style={{
                width: "100%",
                height: "220px",
                backgroundColor: "#000000",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem"
              }}>
                <img src={resolveImageUrl(selectedScan.annotated_image_url)} alt="Scanned Label" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block" }}>Compliance Status</span>
                <StatusBadge status={selectedScan.compliance_status || "POTENTIAL_NON_COMPLIANCE"} size="sm" />
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", display: "block" }}>Audit Date</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ffffff" }}>{formatDateOnly(selectedScan.created_at || selectedScan.date)}</span>
              </div>
            </div>

            {selectedScan.declarations && Array.isArray(selectedScan.declarations) && (
              <div>
                <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: 800, color: "#38bdf8" }}>
                  Isolated Declarations ({selectedScan.declarations.length})
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "200px", overflowY: "auto" }}>
                  {selectedScan.declarations.map((d, i) => (
                    <div key={i} style={{ padding: "0.55rem 0.75rem", backgroundColor: "rgba(7, 11, 20, 0.6)", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ffffff" }}>{d.rule_name || d.name || d.rule_id}</span>
                      <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>{d.extracted_value || d.value || "Detected"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedScan(null)}
              style={{
                width: "100%",
                padding: "0.7rem",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "8px",
                color: "#38bdf8",
                fontSize: "0.85rem",
                fontWeight: 800,
                cursor: "pointer",
                marginTop: "1.25rem"
              }}
            >
              Close Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};