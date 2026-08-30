import { resolveImageUrl } from "../../utils/imageUrl";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { WorkflowStepper } from "../../components/WorkflowStepper";

export const ManufacturerViolations = ({ onNavigate }) => {
  const { token } = useAuth();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Remedy Form
  const [whatWasChanged, setWhatWasChanged] = useState("");
  const [explanation, setExplanation] = useState("");
  const [batchNo, setBatchNo] = useState("BATCH-2026-08");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchViolations = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/manufacturer/violations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setViolations(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchViolations();
  }, [token]);

  const handleOpenRemedyModal = (v) => {
    setSelectedViolation(v);
    setWhatWasChanged(`Redesigned packaging label to comply with Rule ${v.rule_id}. Adjusted font height and added missing declarations.`);
    setExplanation("Cylinder artwork proofs updated. Old packaging stock will be quarantined and recycled.");
    setBatchNo(`BATCH-2026-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setSelectedFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleSubmitRemedy = async (e) => {
    e.preventDefault();
    if (!selectedViolation) return;
    setSubmitting(true);

    let finalCorrectedImageUrl = null;

    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const upRes = await fetch(`http://127.0.0.1:8000/api/upload-evidence`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (upRes.ok) {
          const upData = await upRes.json();
          finalCorrectedImageUrl = upData.url;
        }
      } catch (upErr) {
        console.error("Failed to upload artwork file:", upErr);
      }
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/manufacturer/violations/${selectedViolation.id}/corrective-action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          violation_code: selectedViolation.violation_code,
          what_was_changed: whatWasChanged,
          explanation: explanation,
          affected_batch_numbers: [batchNo],
          action_type: "REVISED_ARTWORK",
          corrected_image_url: finalCorrectedImageUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to submit corrective action");

      setFeedback({
        type: "success",
        text: `✓ Corrective action ${data.ca_code} submitted for ${selectedViolation.violation_code}. Awaiting Officer review.`
      });
      setSelectedViolation(null);
      fetchViolations();
    } catch (err) {
      alert(err.message || "Failed to submit corrective action");
    } finally {
      setSubmitting(false);
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
            <span>⚠️</span>
            <span>Statutory Show Cause Response Desk • PCR-2011</span>
          </div>
          <h2 style={{ margin: "0.1rem 0", fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
            Show Cause Notices & Statutory Violations
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
            Respond to official non-compliance notices served by the Legal Metrology Officer with corrected artwork proofs.
          </p>
        </div>

        <button
          onClick={() => onNavigate("/manufacturer/corrective-actions")}
          style={{
            padding: "0.65rem 1.3rem",
            backgroundColor: "rgba(30, 41, 59, 0.8)",
            color: "#38bdf8",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "8px",
            fontSize: "0.84rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <span>🛠️</span>
          <span>View Submitted Remedies</span>
        </button>
      </div>

      {feedback && (
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
          <div>{feedback.text}</div>
          <button onClick={() => setFeedback(null)} style={{ background: "none", border: "none", color: "#34d399", fontSize: "1rem", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Violations Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {violations.length > 0 ? (
          violations.map((v) => {
            const isResolved = v.status === "RESOLVED";
            const isEscalated = v.status === "ESCALATED";
            const imgUrl = resolveImageUrl(v.evidence_image_url || v.annotated_image_url);

            return (
              <div
                key={v.id}
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "14px",
                  border: isEscalated ? "1.5px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "1.5rem",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#f87171" }}>
                        {v.violation_code}
                      </span>
                      <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                        {v.product_name}
                      </span>
                      {v.brand && (
                        <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                          • {v.brand}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#cbd5e1", marginTop: "4px" }}>
                      Breach: <strong style={{ color: "#fb923c" }}>{v.rule_name || `Rule ${v.rule_id}`}</strong> • Served on {formatDateOnly(v.created_at)}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <StatusBadge status={v.status} size="sm" />
                    {!isResolved && !isEscalated && (
                      <button
                        onClick={() => handleOpenRemedyModal(v)}
                        style={{
                          padding: "0.45rem 1rem",
                          background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "0.82rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(234, 88, 12, 0.35)"
                        }}
                      >
                        Submit Remedy Proof →
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Delete statutory notice ${v.violation_code}?`)) return;
                        try {
                          const res = await fetch(`http://127.0.0.1:8000/api/manufacturer/violations/${v.id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          if (res.ok) {
                            setFeedback({ type: "success", text: `✓ Notice ${v.violation_code} deleted.` });
                            fetchViolations();
                          } else {
                            alert("Failed to delete notice.");
                          }
                        } catch (err) {
                          alert("Failed to delete notice.");
                        }
                      }}
                      style={{
                        padding: "0.45rem 0.65rem",
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        color: "#f87171",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "8px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                      title="Delete Notice"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Finding & Evidence Split */}
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  {imgUrl && (
                    <div style={{
                      width: "110px",
                      height: "110px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      backgroundColor: "#000000",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <img src={imgUrl} alt="Violation Evidence" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                  )}

                  <div style={{ flex: 1, backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.85rem 1rem", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#f87171", textTransform: "uppercase" }}>
                      Legal Metrology Officer Finding
                    </div>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.84rem", color: "#e2e8f0", lineHeight: 1.45 }}>
                      {v.reason || v.officer_public_finding || "Mandatory declarations missing or non-compliant under Packaged Commodities Rules, 2011."}
                    </p>
                  </div>
                </div>

                {/* Stepper */}
                <WorkflowStepper
                  currentStatus={v.status}
                  complaintCode={v.complaint_code}
                  violationCode={v.violation_code}
                />
              </div>
            );
          })
        ) : (
          <EmptyState
            icon="✓"
            title="Zero active statutory notices"
            description="Your packaging manufacturing operations are in full compliance with Legal Metrology PCR-2011."
            actionText="Run Pre-Market Label Scan"
            onAction={() => onNavigate("/manufacturer/compliance")}
          />
        )}
      </div>

      {/* Remedy Submission Modal */}
      {selectedViolation && (
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
            width: "580px",
            maxWidth: "94vw",
            maxHeight: "92vh",
            overflowY: "auto",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(52, 211, 153, 0.25)",
            border: "1.5px solid rgba(52, 211, 153, 0.35)"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#34d399", textTransform: "uppercase" }}>
                  Statutory Corrective Action Protocol
                </div>
                <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}>
                  Submit Remedy Proof
                </h3>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  Notice: <strong style={{ color: "#f87171" }}>{selectedViolation.violation_code}</strong> • {selectedViolation.product_name} • Rule {selectedViolation.rule_id}
                </span>
              </div>
              <button
                onClick={() => setSelectedViolation(null)}
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

            <form onSubmit={handleSubmitRemedy} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.3rem" }}>
                  What was modified / rectified on the packaging artwork? *
                </label>
                <textarea
                  value={whatWasChanged}
                  onChange={(e) => setWhatWasChanged(e.target.value)}
                  rows={2}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: "rgba(7, 11, 20, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.84rem",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.3rem" }}>
                  Technical Explanation & Quality Assurance Measures *
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={3}
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: "rgba(7, 11, 20, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.84rem",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.3rem" }}>
                    Affected Batch Identifier *
                  </label>
                  <input
                    type="text"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.8rem",
                      backgroundColor: "rgba(7, 11, 20, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.84rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.3rem" }}>
                    Attach Corrected Artwork File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                      width: "100%",
                      padding: "0.45rem",
                      backgroundColor: "rgba(7, 11, 20, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      color: "#94a3b8",
                      fontSize: "0.78rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {previewUrl && (
                <div style={{
                  width: "100%",
                  height: "140px",
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid rgba(52, 211, 153, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <img src={previewUrl} alt="Corrected Proof" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "0.85rem",
                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  fontWeight: 900,
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 15px rgba(5, 150, 105, 0.4)",
                  marginTop: "0.5rem"
                }}
              >
                <span>{submitting ? "Submitting Corrective Proof..." : "Submit Corrective Action Proof 🚀"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};