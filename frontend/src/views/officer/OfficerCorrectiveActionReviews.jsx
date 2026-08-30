import { resolveImageUrl } from "../../utils/imageUrl";
﻿import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { WorkflowStepper } from "../../components/WorkflowStepper";

export const OfficerCorrectiveActionReviews = ({ onNavigate }) => {
  const { token } = useAuth();
  const [caList, setCaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCa, setSelectedCa] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchCAs = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/officer/corrective-actions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((d) => {
        setCaList(d || []);
        if (d && d.length > 0) {
          if (!selectedCa || !d.some(x => x.id === selectedCa.id)) {
            setSelectedCa(d[0]);
          } else {
            const updated = d.find(x => x.id === selectedCa.id);
            setSelectedCa(updated);
          }
        } else {
          setSelectedCa(null);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCAs();
  }, [token]);

  const handleDeleteCA = async (id, code, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete corrective action record "${code || id}"?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/officer/corrective-actions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFeedback({ type: "success", text: `✓ Corrective action ${code || id} deleted.` });
        if (selectedCa?.id === id) setSelectedCa(null);
        fetchCAs();
      } else {
        alert("Failed to delete corrective action.");
      }
    } catch (err) {
      alert("Failed to delete corrective action.");
    }
  };

  const handleDecision = async (decision) => {
    if (!selectedCa) return;
    setActionLoading(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/officer/corrective-actions/${selectedCa.id}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          decision: decision,
          officer_notes: decisionNotes,
          reason: decisionNotes
        })
      });

      const resData = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          text: `✓ Decision '${decision}' recorded for ${selectedCa.ca_code}. Manufacturer notified.`
        });
        setActiveModal(null);
        setDecisionNotes("");
        fetchCAs();
      } else {
        setFeedback({ type: "error", text: resData.detail || "Failed to execute decision." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Network error executing decision." });
    } finally {
      setActionLoading(false);
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
            <span>⚖️</span>
            <span>Statutory Corrective Action Adjudication Desk • PCR-2011</span>
          </div>
          <h2 style={{ margin: "0.1rem 0", fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
            Manufacturer Remedy Reviews & Verification
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
            Side-by-side evidence review of manufacturer packaging artwork corrections with direct statutory enforcement authority.
          </p>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: "0.85rem 1.25rem",
          borderRadius: "10px",
          marginBottom: "1.25rem",
          backgroundColor: feedback.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
          border: `1.5px solid ${feedback.type === "success" ? "#10b981" : "#ef4444"}`,
          color: feedback.type === "success" ? "#34d399" : "#f87171",
          fontSize: "0.86rem",
          fontWeight: 700,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>{feedback.text}</div>
          <button onClick={() => setFeedback(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem" }}>✕</button>
        </div>
      )}

      {/* Main Split: Queue on Left, Side-by-Side Reviewer on Right */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "1.5rem" }}>
        {/* Left CA Queue */}
        <div style={{
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          borderRadius: "14px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)"
        }}>
          <div style={{
            padding: "1rem 1.25rem",
            backgroundColor: "rgba(7, 11, 20, 0.8)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#ffffff" }}>Remedies Queue</span>
            <span style={{ fontSize: "0.74rem", padding: "0.15rem 0.55rem", borderRadius: "999px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 800 }}>
              {caList.length}
            </span>
          </div>

          <div style={{ maxHeight: "calc(100vh - 230px)", overflowY: "auto" }}>
            {caList.length === 0 ? (
              <div style={{ padding: "2rem 1rem" }}>
                <EmptyState
                  icon="✓"
                  title="Queue clear"
                  description="No corrective action filings pending officer adjudication."
                />
              </div>
            ) : (
              caList.map((ca) => {
                const isSelected = selectedCa?.id === ca.id;
                return (
                  <div
                    key={ca.id}
                    onClick={() => setSelectedCa(ca)}
                    style={{
                      padding: "1rem 1.25rem",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                      backgroundColor: isSelected ? "rgba(56, 189, 248, 0.15)" : "transparent",
                      borderLeft: isSelected ? "3px solid #38bdf8" : "3px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 800, color: isSelected ? "#38bdf8" : "#ffffff" }}>
                        {ca.ca_code}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <StatusBadge status={ca.status} size="sm" />
                        <button
                          onClick={(e) => handleDeleteCA(ca.id, ca.ca_code, e)}
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#f87171",
                            borderRadius: "4px",
                            padding: "0.2rem 0.4rem",
                            fontSize: "0.72rem",
                            cursor: "pointer"
                          }}
                          title="Delete Remedy Record"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1", marginTop: "4px" }}>
                      {ca.product_name}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#94a3b8", marginTop: "2px" }}>
                      {ca.manufacturer_name} • {ca.violation_code}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side-by-Side Reviewer */}
        {selectedCa ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Top Action & Authority Header */}
            <div style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(12px)",
              borderRadius: "14px",
              padding: "1.5rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#ffffff" }}>
                    {selectedCa.ca_code}
                  </span>
                  <span style={{ fontSize: "0.84rem", color: "#94a3b8" }}>
                    for Notice <strong style={{ color: "#f87171" }}>{selectedCa.violation_code}</strong> ({selectedCa.product_name})
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#cbd5e1", marginTop: "4px" }}>
                  Submitted on {formatDateOnly(selectedCa.submitted_at)} by <strong style={{ color: "#38bdf8" }}>{selectedCa.manufacturer_name}</strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {selectedCa.status === "PENDING_OFFICER_REVIEW" ? (
                  <div style={{ display: "flex", gap: "0.45rem" }}>
                    <button
                      onClick={() => setActiveModal("APPROVE")}
                      style={{
                        padding: "0.55rem 1.1rem",
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(5,150,105,0.3)"
                      }}
                    >
                      ✓ APPROVE REMEDY
                    </button>
                    <button
                      onClick={() => setActiveModal("REQUEST_REVISION")}
                      style={{
                        padding: "0.55rem 0.95rem",
                        backgroundColor: "rgba(217, 119, 6, 0.2)",
                        color: "#fbbf24",
                        border: "1px solid rgba(217, 119, 6, 0.4)",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      🔄 REVISION
                    </button>
                    <button
                      onClick={() => setActiveModal("DENY")}
                      style={{
                        padding: "0.55rem 0.95rem",
                        backgroundColor: "rgba(220, 38, 38, 0.2)",
                        color: "#f87171",
                        border: "1px solid rgba(220, 38, 38, 0.4)",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      ✕ DENY
                    </button>
                    <button
                      onClick={() => setActiveModal("ESCALATE")}
                      style={{
                        padding: "0.55rem 0.95rem",
                        backgroundColor: "rgba(107, 33, 168, 0.2)",
                        color: "#c084fc",
                        border: "1px solid rgba(107, 33, 168, 0.4)",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      🚨 ESCALATE
                    </button>
                  </div>
                ) : (
                  <StatusBadge status={selectedCa.status} size="lg" />
                )}

                <button
                  onClick={() => handleDeleteCA(selectedCa.id, selectedCa.ca_code)}
                  style={{
                    padding: "0.55rem 0.85rem",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    color: "#f87171",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                  title="Delete Remedy Record"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>

            {/* Stepper */}
            <div style={{
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(12px)",
              borderRadius: "14px",
              padding: "1.25rem 1.5rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)"
            }}>
              <WorkflowStepper
                currentStatus={selectedCa.status}
                violationCode={selectedCa.violation_code}
                caCode={selectedCa.ca_code}
              />
            </div>

            {/* Side-by-Side Comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {/* Original Non-Compliant Evidence */}
              <div style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(12px)",
                borderRadius: "14px",
                padding: "1.25rem",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#f87171", textTransform: "uppercase" }}>
                    🔴 Original Non-Compliant Evidence
                  </div>
                  <span style={{ fontSize: "0.72rem", backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#f87171", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>
                    Notice {selectedCa.violation_code}
                  </span>
                </div>

                <div style={{
                  width: "100%",
                  height: "220px",
                  backgroundColor: "#000000",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem"
                }}>
                  {selectedCa.evidence_image_url && resolveImageUrl(selectedCa.evidence_image_url) ? (
                    <img src={resolveImageUrl(selectedCa.evidence_image_url)} alt="Original Non-Compliant Proof" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  ) : (
                    <div style={{ color: "#64748b", fontSize: "0.82rem" }}>No Original Image Logged</div>
                  )}
                </div>

                <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Inspector Finding</div>
                  <div style={{ fontSize: "0.82rem", color: "#e2e8f0", marginTop: "2px" }}>
                    {selectedCa.violation_reason || "Statutory breach verified under Legal Metrology Act, 2009."}
                  </div>
                </div>
              </div>

              {/* Manufacturer Corrected Proof */}
              <div style={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(12px)",
                borderRadius: "14px",
                padding: "1.25rem",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#34d399", textTransform: "uppercase" }}>
                    🟢 Manufacturer Corrected Proof
                  </div>
                  <span style={{ fontSize: "0.72rem", backgroundColor: "rgba(52, 211, 153, 0.2)", color: "#34d399", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>
                    {selectedCa.ca_code}
                  </span>
                </div>

                <div style={{
                  width: "100%",
                  height: "220px",
                  backgroundColor: "#000000",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem"
                }}>
                  {selectedCa.corrected_image_url && resolveImageUrl(selectedCa.corrected_image_url) ? (
                    <img src={resolveImageUrl(selectedCa.corrected_image_url)} alt="Corrected Artwork" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  ) : (
                    <div style={{ color: "#64748b", fontSize: "0.82rem" }}>No Corrected Artwork File Uploaded</div>
                  )}
                </div>

                <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>What Was Modified</div>
                  <div style={{ fontSize: "0.82rem", color: "#38bdf8", fontWeight: 700, marginTop: "2px" }}>
                    {selectedCa.what_was_changed}
                  </div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginTop: "8px" }}>Technical Explanation</div>
                  <div style={{ fontSize: "0.8rem", color: "#cbd5e1", marginTop: "2px" }}>
                    {selectedCa.explanation}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "4rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <EmptyState
              icon="⚖️"
              title="Select a remedy from the queue"
              description="Click on any manufacturer corrective action submission on the left to review proof side-by-side."
            />
          </div>
        )}
      </div>

      {/* Decision Confirmation Modal */}
      {activeModal && (
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
            width: "520px",
            maxWidth: "94vw",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.25)",
            border: "1.5px solid rgba(56, 189, 248, 0.35)"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}>
              Confirm Action: {activeModal}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#cbd5e1", marginBottom: "1rem" }}>
              You are about to record the decision <strong style={{ color: "#38bdf8" }}>{activeModal}</strong> for remedy <strong style={{ color: "#ffffff" }}>{selectedCa?.ca_code}</strong>.
            </p>

            <textarea
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Enter official officer comments or reason..."
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "rgba(7, 11, 20, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.86rem",
                boxSizing: "border-box",
                marginBottom: "1.25rem",
                fontFamily: "inherit"
              }}
            />

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setActiveModal(null)}
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
                onClick={() => handleDecision(activeModal)}
                disabled={actionLoading}
                style={{
                  flex: 1.5,
                  padding: "0.75rem",
                  background: activeModal === "APPROVE" ? "linear-gradient(135deg, #059669 0%, #047857 100%)" : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 800,
                  cursor: actionLoading ? "not-allowed" : "pointer"
                }}
              >
                {actionLoading ? "Recording..." : `Confirm ${activeModal}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};