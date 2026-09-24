import { API_BASE_URL } from "../../config";
import { resolveImageUrl } from "../../utils/imageUrl";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { WorkflowStepper } from "../../components/WorkflowStepper";
import { LegalBasisModal } from "../../components/LegalBasisModal";

export const OfficerCaseDetail = ({ caseId, onNavigate }) => {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'APPROVE', 'DENY', 'REQUEST_REVISION', 'ESCALATE'
  const [decisionNotes, setDecisionNotes] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [expandedRule, setExpandedRule] = useState("LM-06");
  const [showLegalModal, setShowLegalModal] = useState(false);

  const fetchCaseDetail = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/officer/cases/${caseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Case not found");
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (caseId) fetchCaseDetail();
  }, [caseId, token]);

  const handleDecision = async (decision) => {
    if (!data?.corrective_actions?.length) {
      alert("No active corrective action found to review for this case.");
      return;
    }
    const targetCa = data.corrective_actions[0];
    setActionLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/officer/corrective-actions/${targetCa.id}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          decision: decision,
          officer_notes: decisionNotes,
          reason: decisionReason || decisionNotes
        })
      });

      const resData = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", text: `Decision '${decision}' executed for ${targetCa.ca_code}. Case updated.` });
        setActiveModal(null);
        setDecisionNotes("");
        setDecisionReason("");
        fetchCaseDetail();
      } else {
        setFeedback({ type: "error", text: resData.detail || "Failed to execute decision." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Network error executing decision." });
    } finally {
      setActionLoading(false);
    }
  };

  

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Loading case dossier...</div>;
  }

  if (!data) {
          

  return (
      <div style={{ padding: "2rem" }}>
        <button onClick={() => onNavigate("/officer/violations")} style={{ marginBottom: "1rem" }}>← Back to Violations</button>
        <div style={{ color: "#ef4444" }}>Case not found or access denied.</div>
      </div>
    );
  }

  const { violation, complaint, corrective_actions, audit_timeline } = data;
  const latestCa = corrective_actions?.[0];

  const rulesList = [
    { id: "LM-01", name: "Manufacturer / Packer Identity & Address", rule: "Rule 6(1)(a)" },
    { id: "LM-02", name: "Generic Name of Commodity", rule: "Rule 6(1)(b)" },
    { id: "LM-03", name: "Net Quantity Declaration & Standard Units", rule: "Rule 6(1)(c)" },
    { id: "LM-04", name: "Month & Year of Manufacture / Packaging", rule: "Rule 6(1)(d)" },
    { id: "LM-05", name: "Best Before / Expiry Date", rule: "Rule 6(1)(d)" },
    { id: "LM-06", name: "Retail Sale Price (MRP incl. of all taxes)", rule: "Rule 6(1)(e)" },
    { id: "LM-07", name: "Unit Sale Price (USP)", rule: "Rule 6(11)" },
    { id: "LM-08", name: "Consumer Care Details (Name, Phone, Email)", rule: "Rule 6(1)(g)" },
    { id: "LM-09", name: "Country of Origin / Import", rule: "Rule 6(10)" },
    { id: "LM-10", name: "Dimensions of Commodity / Size Code", rule: "Rule 6(1)(f)" },
    { id: "LM-11", name: "Statutory Declaration Font Size", rule: "Rule 7 & Table I" }
  ];

  return (
    <div style={{ padding: "1.75rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Top Navigation & Dossier Title Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <button
          onClick={() => onNavigate("/officer/violations")}
          style={{
            background: "none",
            border: "none",
            color: "#1e3a8a",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            marginBottom: "0.5rem"
          }}
        >
          ← Back to Show Cause Notices
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800, color: "#0f172a" }}>
                Case Dossier: {violation.violation_code}
              </h2>
              <StatusBadge status={violation.status} size="md" />
            </div>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              Product: <strong>{violation.product_name}</strong> • Unit: <strong>{violation.manufacturer_name}</strong> • Rule {violation.rule_id}
            </p>
          </div>

          {/* Top Quick Decision Actions (if pending review) */}
          {latestCa && latestCa.status === "PENDING_OFFICER_REVIEW" && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setActiveModal("APPROVE")}
                style={{
                  padding: "0.55rem 1rem",
                  backgroundColor: "#059669",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                ✓ APPROVE REMEDY
              </button>
              <button
                onClick={() => setActiveModal("REQUEST_REVISION")}
                style={{
                  padding: "0.55rem 0.9rem",
                  backgroundColor: "#d97706",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                🔄 REQUEST REVISION
              </button>
              <button
                onClick={() => setActiveModal("DENY")}
                style={{
                  padding: "0.55rem 0.9rem",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
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
                  padding: "0.55rem 0.9rem",
                  backgroundColor: "#6b21a8",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                🚨 ESCALATE
              </button>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: "0.75rem 1rem",
          borderRadius: "6px",
          marginBottom: "1.25rem",
          backgroundColor: feedback.type === "success" ? "#d1fae5" : "#fee2e2",
          color: feedback.type === "success" ? "#065f46" : "#991b1b",
          fontSize: "0.85rem",
          fontWeight: 700
        }}>
          {feedback.text}
        </div>
      )}

      {/* SECTION 1: VISUAL WORKFLOW LIFECYCLE STEPPER */}
      <WorkflowStepper
        currentStatus={violation.status}
        complaintCode={complaint?.complaint_code}
        violationCode={violation.violation_code}
        caCode={latestCa?.ca_code}
      />

      {/* SECTION 2: GRIEVANCE & STATUTORY FINDINGS (2-COL) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Left: Grievance Details */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          padding: "1.25rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <h3 style={{ margin: "0 0 0.85rem 0", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.4rem" }}>
            1. Grievance & Product Information
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.82rem" }}>
            <div>
              <span style={{ color: "#64748b", display: "block" }}>Product Name:</span>
              <strong style={{ color: "#0f172a" }}>{violation.product_name}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block" }}>Manufacturer / Packer:</span>
              <strong style={{ color: "#0f172a" }}>{violation.manufacturer_name}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block" }}>Grievance Tracking Code:</span>
              <strong style={{ color: "#1e3a8a" }}>{complaint?.complaint_code || "Direct Officer Audit"}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block" }}>Complainant:</span>
              <strong style={{ color: "#334155" }}>{complaint?.consumer_name || "Legal Metrology Inspector"}</strong>
            </div>
          </div>

          <div style={{ marginTop: "1rem", backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "6px", fontSize: "0.8rem", border: "1px solid #e2e8f0" }}>
            <span style={{ fontWeight: 700, color: "#475569" }}>Consumer Grievance Narrative:</span>
            <p style={{ margin: "4px 0 0 0", color: "#334155", lineHeight: 1.4 }}>
              {complaint?.description || "Officer-initiated statutory non-compliance audit under PCR 2011."}
            </p>
          </div>
        </div>

        {/* Right: Statutory Rule Violation Details */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          padding: "1.25rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <h3 style={{ margin: "0 0 0.85rem 0", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.4rem" }}>
            2. Statutory Non-Compliance Finding
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.82rem" }}>
            <div>
              <span style={{ color: "#64748b", display: "block" }}>Breached Rule:</span>
              <strong style={{ color: "#b91c1c" }}>Rule {violation.rule_id} - {violation.rule_name}</strong>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block" }}>Statutory Severity:</span>
              <span style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.15rem 0.5rem",
                borderRadius: "4px",
                backgroundColor: "#fee2e2",
                color: "#991b1b"
              }}>
                {violation.severity}
              </span>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block" }}>Enforcement Standard:</span>
              <span>PCR 2011 Mandatory Declarations</span>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block" }}>Date Notice Served:</span>
              <span>{violation.created_at}</span>
            </div>
          </div>

          <div style={{ marginTop: "1rem", backgroundColor: "#fef2f2", padding: "0.75rem", borderRadius: "6px", fontSize: "0.8rem", border: "1px solid #fecaca" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontWeight: 700, color: "#991b1b" }}>Inspector Finding & Directive:</span>
              <button
                type="button"
                onClick={() => setShowLegalModal(true)}
                style={{
                  padding: "0.2rem 0.55rem",
                  backgroundColor: "rgba(185, 28, 28, 0.1)",
                  color: "#b91c1c",
                  border: "1px solid #fecaca",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                View Legal Basis ⚖️
              </button>
            </div>
            <p style={{ margin: "4px 0 0 0", color: "#7f1d1d", fontWeight: 600, lineHeight: 1.4 }}>
              {violation.officer_public_finding || violation.reason}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: SIDE-BY-SIDE EVIDENCE COMPARISON */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        padding: "1.25rem",
        border: "1px solid #e2e8f0",
        marginBottom: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>🖼️</span>
          <span>3. Statutory Evidence: Original Non-Compliant vs Manufacturer Corrected Artwork</span>
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Left: Original Violation Evidence */}
          <div style={{ border: "1.5px solid #fecaca", borderRadius: "8px", padding: "1rem", backgroundColor: "#fafafa" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#b91c1c" }}>
                🔴 Original Non-Compliant Package (OCR Evidence)
              </span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "4px", backgroundColor: "#fee2e2", color: "#991b1b" }}>
                Rule {violation.rule_id}
              </span>
            </div>

            <div style={{ textAlign: "center", backgroundColor: "#f1f5f9", borderRadius: "6px", padding: "0.5rem", minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {resolveImageUrl(violation.annotated_image_url || violation.evidence_image_url) ? (
                <img
                  src={resolveImageUrl(violation.annotated_image_url || violation.evidence_image_url)}
                  alt="Original Evidence"
                  style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "4px", objectFit: "contain" }}
                />
              ) : (
                <div style={{ color: "#94a3b8", fontSize: "0.82rem", padding: "1.5rem" }}>
                  📷 No photographic evidence attached with this grievance.<br />
                  <span style={{ fontSize: "0.74rem" }}>Product: <strong>{violation.product_name}</strong></span>
                </div>
              )}
            </div>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.76rem", color: "#64748b" }}>
              <strong>OCR Flag:</strong> {violation.reason}
            </p>
          </div>

          {/* Right: Manufacturer Remedy */}
          <div style={{ border: "1.5px solid #a7f3d0", borderRadius: "8px", padding: "1rem", backgroundColor: "#fafafa" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#047857" }}>
                🟢 Manufacturer Corrected Artwork Proof
              </span>
              {latestCa && (
                <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "4px", backgroundColor: "#ecfdf5", color: "#065f46" }}>
                  {latestCa.ca_code}
                </span>
              )}
            </div>

            {latestCa ? (
              <>
                <div style={{ textAlign: "center", backgroundColor: "#f1f5f9", borderRadius: "6px", padding: "0.5rem", minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {resolveImageUrl(latestCa.corrected_image_url) ? (
                    <img
                      src={resolveImageUrl(latestCa.corrected_image_url)}
                      alt="Corrected Artwork"
                      style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "4px", objectFit: "contain" }}
                    />
                  ) : (
                    <div style={{ color: "#94a3b8", fontSize: "0.82rem", padding: "1.5rem" }}>
                      🎨 Written remedy statement submitted (no artwork file attached).
                    </div>
                  )}
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.78rem" }}>
                  <p style={{ margin: "0 0 4px 0", color: "#334155" }}>
                    <strong>What was changed:</strong> {latestCa.what_was_changed}
                  </p>
                  <p style={{ margin: "0", color: "#475569" }}>
                    <strong>Explanation:</strong> {latestCa.explanation}
                  </p>
                </div>
              </>
            ) : (
              <div style={{ minHeight: "220px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.85rem" }}>
                <span>⏳ Awaiting corrective action proof from manufacturer</span>
                <span style={{ fontSize: "0.74rem", marginTop: "4px" }}>Notice served to: {violation.manufacturer_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: 11-CATEGORY STATUTORY ANALYSIS ACCORDION */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        padding: "1.25rem",
        border: "1px solid #e2e8f0",
        marginBottom: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        <h3 style={{ margin: "0 0 0.85rem 0", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>📜</span>
          <span>4. 11 Mandatory Legal Metrology Categories (PCR-2011 Framework)</span>
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          {rulesList.map((r) => {
            const isBreached = r.id === violation.rule_id;
            const isExpanded = expandedRule === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setExpandedRule(isExpanded ? null : r.id)}
                style={{
                  padding: "0.65rem 0.85rem",
                  borderRadius: "6px",
                  border: `1px solid ${isBreached ? "#fecaca" : "#e2e8f0"}`,
                  backgroundColor: isBreached ? "#fff5f5" : "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem" }}>{isBreached ? "⚠️" : "✓"}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: isBreached ? "#b91c1c" : "#1e293b" }}>
                      {r.id}: {r.name}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>{r.rule}</span>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(0,0,0,0.05)", fontSize: "0.75rem", color: isBreached ? "#7f1d1d" : "#475569" }}>
                    {isBreached ? (
                      <div>
                        <strong>Statutory Breach Flagged:</strong> {violation.reason}
                      </div>
                    ) : (
                      <div>
                        <strong>Status:</strong> Verified compliant under Legal Metrology Act, 2009.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: COMPLETE AUDIT TRAIL */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        padding: "1.25rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>📑</span>
          <span>5. Complete Immutable Audit Trail</span>
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {audit_timeline?.map((log, idx) => (
            <div key={idx} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "0.6rem 0.75rem",
              backgroundColor: "#f8fafc",
              borderRadius: "6px",
              borderLeft: "3px solid #1e3a8a"
            }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", minWidth: "140px" }}>{log.timestamp}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>{log.action}</span>
                <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "0.5rem" }}>
                  by {log.user_name} ({log.user_role})
                </span>
                {log.details && (
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#475569" }}>
                    {log.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OFFICER DECISION MODAL */}
      {activeModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            width: "520px",
            maxWidth: "90vw",
            padding: "1.5rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{
              margin: "0 0 0.5rem 0",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: activeModal === "APPROVE" ? "#047857" : activeModal === "DENY" ? "#dc2626" : activeModal === "ESCALATE" ? "#6b21a8" : "#d97706"
            }}>
              {activeModal === "APPROVE" ? "Approve Manufacturer Corrective Action"
                : activeModal === "DENY" ? "Deny Corrective Action"
                : activeModal === "ESCALATE" ? "Escalate Violation for Statutory Penalty"
                : "Request Remedy Revision"}
            </h3>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.82rem", color: "#64748b" }}>
              Case: {violation.violation_code} • {violation.product_name} • Unit: {violation.manufacturer_name}
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#334155", marginBottom: "0.25rem" }}>
                {activeModal === "APPROVE" ? "Officer Approval Notes:" : "Officer Reason & Directive (Required):"}
              </label>
              <textarea
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder={
                  activeModal === "APPROVE" ? "e.g., Verified revised packaging artwork meets statutory font size and USP requirements."
                  : activeModal === "DENY" ? "e.g., Font size is still below minimum 3.0mm requirement. Resubmit compliant artwork."
                  : activeModal === "ESCALATE" ? "e.g., Repeated failure to rectify mandatory declarations. Escalating for compounding."
                  : "e.g., Provide photographic proof of updated packaging cylinder tooling."
                }
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || (activeModal !== "APPROVE" && !decisionNotes.trim())}
                onClick={() => handleDecision(activeModal)}
                style={{
                  padding: "0.5rem 1.25rem",
                  backgroundColor: activeModal === "APPROVE" ? "#059669" : activeModal === "DENY" ? "#dc2626" : activeModal === "ESCALATE" ? "#6b21a8" : "#d97706",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {actionLoading ? "Processing..." : `Confirm ${activeModal}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW STATUTORY LEGAL BASIS MODAL */}
      {showLegalModal && (
        <LegalBasisModal
          isOpen={true}
          onClose={() => setShowLegalModal(false)}
          ruleId={violation.rule_id ? `LM-${String(violation.rule_id).padStart(2, "0")}` : "LM-06"}
          categoryName={violation.rule_name || "Statutory Declaration Finding"}
          detectedText={violation.ocr_finding_text || violation.rule_name}
          extractedValue={violation.ocr_finding_text}
          confidence="98.0%"
          status={violation.status}
          evidenceImageUrl={violation.evidence_image_url || violation.annotated_image_url}
          isOfficer={true}
        />
      )}
    </div>
  );
};