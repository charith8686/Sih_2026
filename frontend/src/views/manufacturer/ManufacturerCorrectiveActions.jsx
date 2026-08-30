import { resolveImageUrl } from "../../utils/imageUrl";
﻿import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { WorkflowStepper } from "../../components/WorkflowStepper";

export const ManufacturerCorrectiveActions = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);
  const [msg, setMsg] = useState(null);

  const fetchActions = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/manufacturer/corrective-actions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => setActions(d || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActions();
  }, [token]);

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete corrective action record "${code || id}"?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/manufacturer/corrective-actions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMsg({ type: "success", text: `✓ Corrective action ${code || id} deleted.` });
        if (selectedAction?.id === id) setSelectedAction(null);
        fetchActions();
      } else {
        alert("Failed to delete corrective action.");
      }
    } catch (err) {
      alert("Failed to delete corrective action.");
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", fontWeight: 800, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: "rgba(52, 211, 153, 0.15)", padding: "0.25rem 0.65rem", borderRadius: "999px", marginBottom: "0.3rem" }}>
            <span>🛠️</span>
            <span>Statutory Remedy Redressal Registry • PCR-2011</span>
          </div>
          <h2 style={{ margin: "0.1rem 0", fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
            Corrective Action Filings & Officer Decisions
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
            Track submitted packaging proofs, officer evaluation directives, and statutory case closure under PCR-2011.
          </p>
        </div>

        <button
          onClick={() => onNavigate("/manufacturer/violations")}
          style={{
            padding: "0.65rem 1.3rem",
            background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.86rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 15px rgba(234, 88, 12, 0.35)"
          }}
        >
          <span>⚠️</span>
          <span>View Show Cause Notices →</span>
        </button>
      </div>

      {msg && (
        <div style={{
          padding: "0.85rem 1.25rem",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          border: "1.5px solid #10b981",
          borderRadius: "10px",
          color: "#34d399",
          fontSize: "0.86rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>{msg.text}</div>
          <button onClick={() => setMsg(null)} style={{ background: "none", border: "none", color: "inherit", fontSize: "1rem", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Table of Submitted Remedies */}
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
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Remedy Code</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Notice Ref</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Product Name</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Submitted Change</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Status</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Officer Remarks</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {actions.length > 0 ? (
              actions.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", transition: "background 0.15s ease" }}>
                  <td style={{ padding: "0.9rem 1.25rem", fontWeight: 800, color: "#38bdf8" }}>
                    {a.ca_code}
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", fontWeight: 700, color: "#f87171" }}>
                    {a.violation_code}
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", fontWeight: 700, color: "#ffffff" }}>
                    {a.product_name}
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#cbd5e1" }}>
                    <div style={{ fontWeight: 600 }}>{a.what_was_changed}</div>
                    <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>{formatDateOnly(a.submitted_at)}</div>
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <StatusBadge status={a.status} size="sm" />
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", color: a.officer_review_notes ? "#ffffff" : "#94a3b8", fontSize: "0.8rem" }}>
                    {a.officer_review_notes || "Awaiting inspector evaluation"}
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.45rem", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => setSelectedAction(a)}
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
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDelete(a.id, a.ca_code)}
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
                        title="Delete Remedy Record"
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
                    icon="🛠️"
                    title="No corrective action filings"
                    description="When you receive a statutory show cause notice, submit your revised packaging artwork proofs here."
                    actionText="View Show Cause Notices"
                    onAction={() => onNavigate("/manufacturer/violations")}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      {selectedAction && (
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
            width: "600px",
            maxWidth: "94vw",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(52, 211, 153, 0.25)",
            border: "1.5px solid rgba(52, 211, 153, 0.35)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "0.75rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}>
                  {selectedAction.ca_code}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                  Notice: <strong style={{ color: "#f87171" }}>{selectedAction.violation_code}</strong> ({selectedAction.product_name})
                </span>
              </div>
              <button onClick={() => setSelectedAction(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", color: "#94a3b8", cursor: "pointer" }}>✕</button>
            </div>

            <WorkflowStepper currentStatus={selectedAction.status} violationCode={selectedAction.violation_code} caCode={selectedAction.ca_code} />

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "1.5rem" }}>
              {selectedAction.corrected_image_url && (
                <div style={{
                  width: "100%",
                  height: "200px",
                  backgroundColor: "#000000",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <img src={resolveImageUrl(selectedAction.corrected_image_url)} alt="Corrected Proof" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
              )}

              <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Modified Details</div>
                <div style={{ fontSize: "0.86rem", color: "#38bdf8", fontWeight: 700, marginTop: "2px" }}>{selectedAction.what_was_changed}</div>
              </div>

              <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Explanation</div>
                <div style={{ fontSize: "0.84rem", color: "#cbd5e1", marginTop: "2px" }}>{selectedAction.explanation}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                onClick={() => handleDelete(selectedAction.id, selectedAction.ca_code)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#f87171",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                🗑️ Delete Record
              </button>
              <button
                onClick={() => setSelectedAction(null)}
                style={{
                  flex: 1.5,
                  padding: "0.75rem",
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};