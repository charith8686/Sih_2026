import { API_BASE_URL } from "../../config";
﻿import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";

export const OfficerViolations = ({ onNavigate }) => {
  const { token } = useAuth();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVio, setSelectedVio] = useState(null);
  const [newStatus, setNewStatus] = useState("Under Review");
  const [remarks, setRemarks] = useState("");
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchViolations = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/officer/violations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((d) => setViolations(d || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchViolations();
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedVio) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/officer/violations/${selectedVio.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, remarks })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update status");
      setFeedback({ type: "success", text: `✓ Notice ${selectedVio.violation_code} updated to ${newStatus}.` });
      setSelectedVio(null);
      fetchViolations();
    } catch (err) {
      alert(err.message || "Failed to update notice.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteViolation = async (v) => {
    if (!window.confirm(`Are you sure you want to delete violation notice ${v.violation_code}?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/officer/violations/${v.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFeedback({ type: "success", text: `✓ Violation ${v.violation_code} deleted successfully.` });
        if (selectedVio?.id === v.id) setSelectedVio(null);
        fetchViolations();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.detail || "Failed to delete violation.");
      }
    } catch (err) {
      alert("Network error deleting violation.");
    }
  };

  const formatDateOnly = (dateStr) => {
    if (!dateStr) return "30 Aug 2026";
    if (dateStr.includes(",")) return dateStr.split(",")[0].trim();
    return dateStr;
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1250px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", fontWeight: 800, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: "rgba(239, 68, 68, 0.15)", padding: "0.25rem 0.65rem", borderRadius: "999px", marginBottom: "0.3rem" }}>
            <span>⚠️</span>
            <span>Statutory Violation Notices Registry • PCR-2011</span>
          </div>
          <h2 style={{ margin: "0.1rem 0", fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
            Enforcement Violations & Show Cause Notices
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
            Active statutory notices served to packaging manufacturers under Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>

        <button
          onClick={() => onNavigate("/officer/complaints")}
          style={{
            padding: "0.65rem 1.3rem",
            background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.86rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 15px rgba(6, 182, 212, 0.3)"
          }}
        >
          <span>📬</span>
          <span>Triage Grievances</span>
        </button>
      </div>

      {feedback && (
        <div style={{
          padding: "0.85rem 1.25rem",
          backgroundColor: feedback.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
          border: `1.5px solid ${feedback.type === "success" ? "#10b981" : "#ef4444"}`,
          borderRadius: "10px",
          color: feedback.type === "success" ? "#34d399" : "#f87171",
          fontSize: "0.86rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>{feedback.text}</div>
          <button onClick={() => setFeedback(null)} style={{ background: "none", border: "none", color: "inherit", fontSize: "1rem", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Violations Table */}
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
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Notice ID</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Product & Manufacturer</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Breach Rule</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Severity</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Status</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Date</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {violations.length > 0 ? (
              violations.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", transition: "background 0.15s ease" }}>
                  <td style={{ padding: "0.9rem 1.25rem", fontWeight: 800, color: "#f87171" }}>
                    {v.violation_code}
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <div style={{ fontWeight: 700, color: "#ffffff" }}>{v.product_name}</div>
                    <div style={{ fontSize: "0.76rem", color: "#38bdf8" }}>{v.manufacturer_name}</div>
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#cbd5e1" }}>
                    <div>{v.rule_id}</div>
                    <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>{v.rule_name}</div>
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      backgroundColor: v.severity === "High" ? "rgba(239, 68, 68, 0.2)" : "rgba(234, 88, 12, 0.2)",
                      color: v.severity === "High" ? "#f87171" : "#fb923c"
                    }}>
                      {v.severity}
                    </span>
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <StatusBadge status={v.status} size="sm" />
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#f8fafc", fontWeight: 600 }}>
                    {formatDateOnly(v.created_at)}
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.45rem", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => onNavigate(`/officer/cases/${v.id}`)}
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
                        Case Dossier
                      </button>
                      <button
                        onClick={() => setSelectedVio(v)}
                        style={{
                          padding: "0.4rem 0.75rem",
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          color: "#cbd5e1",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Status
                      </button>
                      <button
                        onClick={() => handleDeleteViolation(v)}
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
                        title="Delete Violation Notice"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: "2rem" }}>
                  <EmptyState
                    icon="✓"
                    title="No active statutory notices"
                    description="Zero pending violation notices served to manufacturers."
                    actionText="Triage Complaints"
                    onAction={() => onNavigate("/officer/complaints")}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status Update Modal */}
      {selectedVio && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(7, 11, 20, 0.85)",
          backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div style={{
            backgroundColor: "#0f172a",
            borderRadius: "16px",
            width: "480px",
            maxWidth: "94vw",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.25)",
            border: "1.5px solid rgba(56, 189, 248, 0.35)"
          }}>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}>
              Update Notice Status
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
              Notice: <strong style={{ color: "#f87171" }}>{selectedVio.violation_code}</strong> ({selectedVio.product_name})
            </p>

            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.3rem" }}>
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.8rem",
                    backgroundColor: "rgba(7, 11, 20, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.86rem",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="OPEN">OPEN (Awaiting Remedy)</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="RESOLVED">RESOLVED (Remedy Approved)</option>
                  <option value="ESCALATED">ESCALATED (Statutory Prosecution)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.3rem" }}>
                  Officer Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Enter status update notes..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: "rgba(7, 11, 20, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.86rem",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedVio(null)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    flex: 1.5,
                    padding: "0.75rem",
                    background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 800,
                    cursor: updating ? "not-allowed" : "pointer"
                  }}
                >
                  {updating ? "Saving..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};