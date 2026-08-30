import { resolveImageUrl } from "../../utils/imageUrl";
﻿import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";
import { WorkflowStepper } from "../../components/WorkflowStepper";

export const UserComplaints = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State: Only Image & Remarks asked from user! Problem is auto-selected in background.
  const [lastScan, setLastScan] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [msg, setMsg] = useState(null);

  const fetchComplaints = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/user/complaints`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setComplaints(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints();
    const savedScan = sessionStorage.getItem("lm_last_scan");
    if (savedScan) {
      try {
        const parsed = JSON.parse(savedScan);
        setLastScan(parsed);
        if (parsed.imageUrl) setPreviewUrl(parsed.imageUrl);
      } catch (e) {}
    }
  }, [token]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setSelectedFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleOpenModal = () => {
    const savedScan = sessionStorage.getItem("lm_last_scan");
    if (!savedScan && !previewUrl) {
      // Must scan first!
      if (window.confirm("Grievances require an audited package scan. Would you like to scan your package now?")) {
        onNavigate("/user/scan");
      }
      return;
    }
    setRemarks("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!previewUrl && !selectedFile) {
      alert("Please attach or scan a package photo evidence first.");
      return;
    }

    setSubmitting(true);
    setMsg(null);

    let finalEvidenceUrl = previewUrl;

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
          finalEvidenceUrl = upData.url;
        }
      } catch (upErr) {
        console.error("Failed to upload evidence photo:", upErr);
      }
    }

    // Auto-selected problem from scan (silent in background, not visible to user)
    const issueType = lastScan?.issueType || "Statutory Non-Compliance Detected in Package Declarations";
    const ruleId = lastScan?.nonCompliantRule || "LM-06";
    const productName = lastScan?.productName || "Audited Packaged Product";
    const manufacturerName = lastScan?.manufacturerName || "ABC Foods Pvt Ltd";

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/user/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_name: productName,
          brand: "Audited Commodity",
          manufacturer_name: manufacturerName,
          issue_type: issueType,
          rule_id: ruleId,
          description: remarks || `Consumer observed statutory non-compliance during packaging inspection. Details automatically forwarded to officer.`,
          evidence_image_url: finalEvidenceUrl,
          ocr_scan_id: lastScan?.scanId || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to submit grievance");

      setMsg({
        type: "success",
        code: data.complaint_code,
        text: `✓ Grievance registered under Reference ID: ${data.complaint_code}. Sent directly to Legal Metrology Officer.`
      });
      setShowModal(false);
      fetchComplaints();
    } catch (err) {
      alert(err.message || "Failed to submit grievance");
    } finally {
      setSubmitting(false);
    }
  };

  

        

  return (
    <div style={{ padding: "2rem", maxWidth: "1150px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: "rgba(56, 189, 248, 0.15)", padding: "0.25rem 0.65rem", borderRadius: "999px", marginBottom: "0.3rem" }}>
            <span>🏛️</span>
            <span>Consumer Redressal Desk • PCR-2011</span>
          </div>
          <h2 style={{ margin: "0.1rem 0", fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
            My Statutory Packaging Grievances
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
            Official grievances submitted to Legal Metrology Officers for investigation and Show Cause Notice issuance.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          style={{
            padding: "0.7rem 1.4rem",
            background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.88rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 15px rgba(234, 88, 12, 0.4)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <span>✍️</span>
          <span>File New Grievance</span>
        </button>
      </div>

      {msg && (
        <div style={{
          padding: "1rem 1.25rem",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          border: "1.5px solid #10b981",
          borderRadius: "10px",
          color: "#34d399",
          fontSize: "0.88rem",
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

      {/* Grievances List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {complaints.length > 0 ? (
          complaints.map((c) => {
            const imgUrl = resolveImageUrl(c.evidence_image_url);

            return (
              <div
                key={c.id}
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "1.5rem",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
                  transition: "all 0.2s ease"
                }}
              >
                {/* Top Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "1.05rem", fontWeight: 900, color: "#38bdf8" }}>
                        {c.complaint_code}
                      </span>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: "#ffffff" }}>
                        {c.product_name}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                        • {c.manufacturer_name || c.brand}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#cbd5e1", marginTop: "3px" }}>
                      Filed on {c.created_at}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <StatusBadge status={c.status} size="sm" />
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Withdraw grievance ${c.complaint_code}?`)) return;
                        try {
                          const res = await fetch(`http://127.0.0.1:8000/api/user/complaints/${c.id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          if (res.ok) {
                            setMsg({ type: "info", text: `Grievance ${c.complaint_code} withdrawn.` });
                            fetchComplaints();
                          }
                        } catch (err) {
                          alert("Failed to withdraw grievance");
                        }
                      }}
                      style={{
                        padding: "0.3rem 0.65rem",
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        color: "#f87171",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "6px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                      title="Withdraw Grievance"
                    >
                      🗑️ Withdraw
                    </button>
                  </div>
                </div>

                {/* Evidence & Remarks */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1.2rem" }}>
                  {imgUrl && (
                    <div style={{
                      width: "85px",
                      height: "85px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      backgroundColor: "#070b14",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <img src={imgUrl} alt="Attached Evidence" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                  )}
                  <p style={{
                    margin: 0,
                    flex: 1,
                    fontSize: "0.84rem",
                    color: "#e2e8f0",
                    backgroundColor: "rgba(7, 11, 20, 0.6)",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    lineHeight: 1.45
                  }}>
                    <strong>Your Remarks:</strong> {c.description}
                  </p>
                </div>

                {/* Stepper */}
                <WorkflowStepper
                  currentStatus={c.status}
                  complaintCode={c.complaint_code}
                  violationCode={c.violation_code}
                />
              </div>
            );
          })
        ) : (
          <EmptyState
            icon="📷"
            title="No package grievances filed yet"
            description="To file a statutory grievance, first scan a package photo with our OCR engine. Any violations will be automatically detected."
            actionText="Scan Package Now"
            onAction={() => onNavigate("/user/scan")}
          />
        )}
      </div>

      {/* STREAMLINED GRIEVANCE MODAL: ONLY ASKS FOR PHOTO & REMARKS */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
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
            width: "520px",
            maxWidth: "94vw",
            maxHeight: "92vh",
            overflowY: "auto",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8), 0 0 35px rgba(56, 189, 248, 0.2)",
            border: "1.5px solid rgba(56, 189, 248, 0.3)"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Legal Metrology Direct Grievance
                </div>
                <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}>
                  File Package Grievance
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* 1. ATTACH / DISPLAY PACKAGE PHOTO */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#f8fafc", marginBottom: "0.4rem" }}>
                  📷 Package Photo Evidence
                </label>
                {previewUrl ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    backgroundColor: "rgba(7, 11, 20, 0.6)",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid rgba(56, 189, 248, 0.3)"
                  }}>
                    <div style={{ width: "65px", height: "65px", borderRadius: "6px", overflow: "hidden", backgroundColor: "#000", flexShrink: 0 }}>
                      <img src={resolveImageUrl(previewUrl)} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#34d399" }}>
                        ✓ Scanned Package Photo Attached
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
                        {selectedFile?.name || "Scanned Evidence Image"}
                      </div>
                    </div>
                    <label style={{
                      padding: "0.35rem 0.75rem",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "#e2e8f0",
                      borderRadius: "6px",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}>
                      Change
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                    </label>
                  </div>
                ) : (
                  <label style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1.5rem 1rem",
                    backgroundColor: "rgba(7, 11, 20, 0.6)",
                    border: "2px dashed rgba(56, 189, 248, 0.4)",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}>
                    <span style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>📸</span>
                    <strong style={{ fontSize: "0.85rem", color: "#38bdf8" }}>
                      Click to Upload or Snap Photo
                    </strong>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                  </label>
                )}
              </div>

              {/* 2. CONSUMER REMARKS ONLY */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#f8fafc", marginBottom: "0.4rem" }}>
                  ✍️ Your Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter any observations (e.g. MRP was printed over, date of packaging missing, net weight feels low...)"
                  rows={4}
                  required
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    backgroundColor: "rgba(7, 11, 20, 0.6)",
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

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "0.85rem",
                  background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
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
                  boxShadow: "0 6px 20px rgba(234, 88, 12, 0.4)",
                  marginTop: "0.5rem",
                  transition: "all 0.15s ease"
                }}
              >
                <span>{submitting ? "Transmitting to Legal Metrology Officer..." : "Submit Grievance to Legal Metrology Officer 🚀"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};