import { API_BASE_URL } from "../../config";
import { resolveImageUrl } from "../../utils/imageUrl";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";

export const OfficerComplaints = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [verifyModal, setVerifyModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);

  // Verify Notice Form State
  const [ruleId, setRuleId] = useState("LM-06");
  const [ruleName, setRuleName] = useState("Retail Sale Price (MRP incl. of all taxes)");
  const [severity, setSeverity] = useState("Medium");
  const [reason, setReason] = useState("");
  const [publicFinding, setPublicFinding] = useState("");
  const [officerNotes, setOfficerNotes] = useState("");

  // Reject Form State
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchComplaints = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/officer/complaints`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setComplaints(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
  }, [token]);

  const openVerifyModal = (c) => {
    setVerifyModal(c);
    setRuleId("LM-06");
    setRuleName("Retail Sale Price (MRP incl. of all taxes)");
    setSeverity("Medium");
    setReason(`Grievance verified: Non-compliance observed in ${c.product_name}. ${c.description}`);
    setPublicFinding(`Statutory Show Cause Notice issued under PCR-2011 for ${c.product_name}.`);
    setOfficerNotes(`Inspector inspection confirmed alleged breach on ${c.created_at}.`);
  };

  const openRejectModal = (c) => {
    setRejectModal(c);
    setRejectionReason("Grievance dismissed: Packaging conforms to Packaged Commodities Rules 2011 exemption threshold.");
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyModal) return;
    setActionLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/officer/complaints/${verifyModal.id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rule_id: ruleId,
          rule_name: ruleName,
          severity,
          reason,
          officer_public_finding: publicFinding,
          officer_notes: officerNotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to verify complaint");

      setFeedback({
        type: "success",
        text: `✓ Show Cause Notice ${data.violation_code} served to ${verifyModal.manufacturer_name || 'Manufacturer'}.`
      });
      setVerifyModal(null);
      fetchComplaints();
    } catch (err) {
      alert(err.message || "Failed to verify grievance");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModal) return;
    setActionLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/officer/complaints/${rejectModal.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rejection_reason: rejectionReason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reject complaint");

      setFeedback({
        type: "info",
        text: `Grievance ${rejectModal.complaint_code} closed without notice.`
      });
      setRejectModal(null);
      fetchComplaints();
    } catch (err) {
      alert(err.message || "Failed to reject grievance");
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", fontWeight: 800, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: "rgba(99, 102, 241, 0.15)", padding: "0.25rem 0.65rem", borderRadius: "999px", marginBottom: "0.3rem" }}>
            <span>📬</span>
            <span>Consumer Grievances Verification Desk • PCR-2011</span>
          </div>
          <h2 style={{ margin: "0.1rem 0", fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
            Consumer Grievances Triage
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
            Verify consumer packaging reports, inspect evidence photos, and issue statutory Show Cause Notices.
          </p>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: "0.85rem 1.25rem",
          backgroundColor: feedback.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(56, 189, 248, 0.15)",
          border: `1.5px solid ${feedback.type === "success" ? "#10b981" : "#38bdf8"}`,
          borderRadius: "10px",
          color: feedback.type === "success" ? "#34d399" : "#38bdf8",
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

      {/* Complaints Table */}
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
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Grievance ID</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Product & Manufacturer</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Consumer Details</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Date</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Status</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Officer Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length > 0 ? (
              complaints.map((c) => {
                const canVerify = c.status === "SUBMITTED" || c.status === "UNDER_REVIEW";

                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", transition: "background 0.15s ease" }}>
                    <td style={{ padding: "0.9rem 1.25rem", fontWeight: 800, color: "#38bdf8" }}>
                      {c.complaint_code}
                    </td>
                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <div style={{ fontWeight: 700, color: "#ffffff" }}>{c.product_name}</div>
                      <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>{c.manufacturer_name || c.brand}</div>
                    </td>
                    <td style={{ padding: "0.9rem 1.25rem", color: "#cbd5e1" }}>
                      <div>{c.consumer_name || "Public Consumer"}</div>
                      <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>{c.issue_type}</div>
                    </td>
                    <td style={{ padding: "0.9rem 1.25rem", color: "#f8fafc", fontWeight: 600 }}>
                      {formatDateOnly(c.created_at)}
                    </td>
                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          style={{
                            padding: "0.35rem 0.75rem",
                            backgroundColor: "rgba(56, 189, 248, 0.15)",
                            color: "#38bdf8",
                            border: "1px solid rgba(56, 189, 248, 0.3)",
                            borderRadius: "6px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          Review Dossier
                        </button>
                        {canVerify && (
                          <>
                            <button
                              onClick={() => openVerifyModal(c)}
                              style={{
                                padding: "0.35rem 0.75rem",
                                background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "0.78rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(234, 88, 12, 0.35)"
                              }}
                            >
                              ⚡ Issue Notice
                            </button>
                            <button
                              onClick={() => openRejectModal(c)}
                              style={{
                                padding: "0.35rem 0.65rem",
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                                color: "#f87171",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "6px",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              ✕ Close
                            </button>
                          </>
                        )}
                        {c.violation_code && (
                          <button
                            onClick={() => onNavigate(`/officer/cases/${c.violation_code || c.id}`)}
                            style={{
                              padding: "0.35rem 0.75rem",
                              backgroundColor: "rgba(16, 185, 129, 0.15)",
                              color: "#34d399",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              borderRadius: "6px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            Case Dossier →
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Delete grievance record ${c.complaint_code}?`)) return;
                            try {
                              const res = await fetch(`${API_BASE_URL}/api/officer/complaints/${c.id}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              if (res.ok) {
                                setFeedback({ type: "success", text: `✓ Grievance ${c.complaint_code} deleted.` });
                                fetchComplaints();
                              } else {
                                alert("Failed to delete grievance.");
                              }
                            } catch (err) {
                              alert("Failed to delete grievance.");
                            }
                          }}
                          style={{
                            padding: "0.35rem 0.55rem",
                            backgroundColor: "rgba(239, 68, 68, 0.15)",
                            color: "#f87171",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "6px",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                          title="Delete Grievance"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: "2rem" }}>
                  <EmptyState
                    icon="✓"
                    title="No grievances requiring triage"
                    description="Zero pending consumer complaints requiring inspector verification."
                    actionText="Launch Statutory Scanner"
                    onAction={() => onNavigate("/officer/scan")}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Dossier Modal */}
      {selectedComplaint && (
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
            width: "560px",
            maxWidth: "94vw",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.25)",
            border: "1.5px solid rgba(56, 189, 248, 0.35)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase" }}>
                  Grievance Dossier
                </div>
                <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}>
                  {selectedComplaint.complaint_code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
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

            {selectedComplaint.evidence_image_url && resolveImageUrl(selectedComplaint.evidence_image_url) && (
              <div style={{
                width: "100%",
                height: "200px",
                backgroundColor: "#000000",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem"
              }}>
                <img src={resolveImageUrl(selectedComplaint.evidence_image_url)} alt="Evidence" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Product & Brand</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>{selectedComplaint.product_name} • {selectedComplaint.manufacturer_name}</div>
              </div>

              <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Consumer Narrative</div>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.84rem", color: "#cbd5e1", lineHeight: 1.45 }}>
                  {selectedComplaint.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedComplaint(null)}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "0.9rem",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}

      {/* Verify & Issue Notice Modal */}
      {verifyModal && (
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
            width: "560px",
            maxWidth: "94vw",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(234, 88, 12, 0.25)",
            border: "1.5px solid rgba(234, 88, 12, 0.4)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#fb923c", textTransform: "uppercase" }}>
                  Legal Metrology Act, 2009 (Rule 6)
                </div>
                <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}>
                  Issue Show Cause Notice
                </h3>
              </div>
              <button
                onClick={() => setVerifyModal(null)}
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

            <form onSubmit={handleVerifySubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.3rem" }}>
                  Statutory Rule Citation
                </label>
                <input
                  type="text"
                  value={`${ruleId}: ${ruleName}`}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.8rem",
                    backgroundColor: "rgba(7, 11, 20, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#38bdf8",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.3rem" }}>
                  Official Statutory Notice Reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required
                  style={{
                    width: "100%",
                    padding: "0.7rem",
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
                  Inspector Internal Audit Notes
                </label>
                <textarea
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
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

              <button
                type="submit"
                disabled={actionLoading}
                style={{
                  padding: "0.85rem",
                  background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  fontWeight: 900,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 15px rgba(234, 88, 12, 0.4)",
                  marginTop: "0.5rem"
                }}
              >
                <span>{actionLoading ? "Serving Show Cause Notice..." : "Serve Statutory Notice to Manufacturer ⚡"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};