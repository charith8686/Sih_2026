import React from "react";

export const WorkflowStepper = ({
  currentStatus = "SUBMITTED",
  complaintCode = null,
  violationCode = null,
  caCode = null,
  onStepClick = null
}) => {
  const normStatus = String(currentStatus || "").toUpperCase().replace(/ /g, "_");

  // Determine stage progress
  // Stage 1: Grievance Filed
  // Stage 2: Officer Verified & Notice Issued
  // Stage 3: Manufacturer Remedy Filed
  // Stage 4: Officer Decision Executed
  // Stage 5: Case Closed & Resolved

  let stage1 = { state: "done", title: "1. Grievance Filed", desc: complaintCode || "Consumer Report" };
  let stage2 = { state: "pending", title: "2. Officer Notice", desc: "Awaiting Triage" };
  let stage3 = { state: "pending", title: "3. Manufacturer Remedy", desc: "Show Cause Response" };
  let stage4 = { state: "pending", title: "4. Officer Decision", desc: "Authority Review" };
  let stage5 = { state: "pending", title: "5. Case Resolved", desc: "Statutory Resolution" };

  if (normStatus === "SUBMITTED") {
    stage1.state = "current";
  } else if (normStatus === "REJECTED") {
    stage1.state = "done";
    stage2 = { state: "failed", title: "2. Grievance Dismissed", desc: "Not a statutory violation" };
  } else if (normStatus === "VIOLATION_CREATED" || normStatus === "OPEN") {
    stage1.state = "done";
    stage2 = { state: "current", title: "2. Notice Served", desc: violationCode || "Show Cause Notice" };
    stage3 = { state: "pending", title: "3. Manufacturer Remedy", desc: "Awaiting Corrective Action" };
  } else if (normStatus === "UNDER_REVIEW" || normStatus === "PENDING_OFFICER_REVIEW") {
    stage1.state = "done";
    stage2.state = "done";
    stage3 = { state: "current", title: "3. Remedy Submitted", desc: caCode || "Corrected Artwork Proof" };
    stage4 = { state: "current", title: "4. Officer Review", desc: "Decision Pending" };
  } else if (normStatus === "APPROVED") {
    stage1.state = "done";
    stage2.state = "done";
    stage3.state = "done";
    stage4 = { state: "done", title: "4. Remedy Approved", desc: "Compliance Verified" };
    stage5 = { state: "current", title: "5. Closing Notice", desc: "Finalizing Resolution" };
  } else if (normStatus === "DENIED") {
    stage1.state = "done";
    stage2.state = "done";
    stage3.state = "done";
    stage4 = { state: "failed", title: "4. Remedy Denied", desc: "Non-Compliant Artwork" };
  } else if (normStatus === "REVISION_REQUIRED" || normStatus === "REQUEST_REVISION") {
    stage1.state = "done";
    stage2.state = "done";
    stage3.state = "done";
    stage4 = { state: "warning", title: "4. Revision Ordered", desc: "Resubmission Required" };
  } else if (normStatus === "ESCALATED") {
    stage1.state = "done";
    stage2.state = "done";
    stage3.state = "done";
    stage4 = { state: "failed", title: "4. Escalated for Penalty", desc: "Statutory Compounding" };
  } else if (normStatus === "RESOLVED") {
    stage1.state = "done";
    stage2.state = "done";
    stage3.state = "done";
    stage4.state = "done";
    stage5 = { state: "done", title: "5. Case Resolved", desc: "Notice Formally Closed" };
  }

  const stages = [stage1, stage2, stage3, stage4, stage5];

  const getStepStyle = (st) => {
    switch (st.state) {
      case "done":
        return {
          circleBg: "#059669",
          circleColor: "#ffffff",
          circleBorder: "#059669",
          icon: "✓",
          titleColor: "#065f46",
          lineBg: "#059669"
        };
      case "current":
        return {
          circleBg: "#1e3a8a",
          circleColor: "#ffffff",
          circleBorder: "#1e3a8a",
          icon: "●",
          titleColor: "#1e3a8a",
          lineBg: "#e2e8f0"
        };
      case "warning":
        return {
          circleBg: "#d97706",
          circleColor: "#ffffff",
          circleBorder: "#d97706",
          icon: "🔄",
          titleColor: "#92400e",
          lineBg: "#fde68a"
        };
      case "failed":
        return {
          circleBg: "#dc2626",
          circleColor: "#ffffff",
          circleBorder: "#dc2626",
          icon: "✕",
          titleColor: "#991b1b",
          lineBg: "#fecaca"
        };
      case "pending":
      default:
        return {
          circleBg: "#ffffff",
          circleColor: "#94a3b8",
          circleBorder: "#cbd5e1",
          icon: "○",
          titleColor: "#64748b",
          lineBg: "#e2e8f0"
        };
    }
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      padding: "1.25rem 1.5rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      marginBottom: "1.5rem"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem" }}>⚡</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Three-Stakeholder Statutory Enforcement Lifecycle
          </span>
        </div>
        <span style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          padding: "0.2rem 0.55rem",
          borderRadius: "999px",
          backgroundColor: normStatus === "RESOLVED" ? "#d1fae5" : normStatus === "UNDER_REVIEW" || normStatus === "PENDING_OFFICER_REVIEW" ? "#eff6ff" : normStatus === "OPEN" || normStatus === "VIOLATION_CREATED" ? "#fee2e2" : "#f1f5f9",
          color: normStatus === "RESOLVED" ? "#065f46" : normStatus === "UNDER_REVIEW" || normStatus === "PENDING_OFFICER_REVIEW" ? "#1e40af" : normStatus === "OPEN" || normStatus === "VIOLATION_CREATED" ? "#991b1b" : "#475569"
        }}>
          Live State: {normStatus.replace(/_/g, " ")}
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "0.75rem",
        position: "relative"
      }}>
        {stages.map((st, idx) => {
          const s = getStepStyle(st);
          const isLast = idx === stages.length - 1;
          return (
            <div
              key={idx}
              onClick={() => onStepClick && onStepClick(idx)}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                cursor: onStepClick ? "pointer" : "default"
              }}
            >
              {/* Connector line */}
              {!isLast && (
                <div style={{
                  position: "absolute",
                  top: "14px",
                  left: "50%",
                  width: "100%",
                  height: "3px",
                  backgroundColor: s.lineBg,
                  zIndex: 1
                }} />
              )}

              {/* Circle */}
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: s.circleBg,
                color: s.circleColor,
                border: `2px solid ${s.circleBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 800,
                position: "relative",
                zIndex: 2,
                boxShadow: st.state === "current" ? "0 0 0 4px rgba(30, 58, 138, 0.15)" : "none",
                transition: "all 0.2s ease"
              }}>
                {s.icon}
              </div>

              {/* Title & Desc */}
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{
                  fontSize: "0.78rem",
                  fontWeight: st.state === "current" ? 800 : 700,
                  color: s.titleColor
                }}>
                  {st.title}
                </div>
                <div style={{
                  fontSize: "0.7rem",
                  color: "#64748b",
                  marginTop: "1px",
                  maxWidth: "140px",
                  lineHeight: 1.2
                }}>
                  {st.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
