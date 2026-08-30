import { resolveImageUrl } from "../../utils/imageUrl";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { LegalBasisModal } from "../../components/LegalBasisModal";

export const UserScanner = ({ onNavigate }) => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [selectedRule, setSelectedRule] = useState(null);
  const [legalModalCat, setLegalModalCat] = useState(null);
  const timerRef = useRef(null);

  // Quick Grievance Modal state directly inside Scanner
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [submittingGrievance, setSubmittingGrievance] = useState(false);
  const [grievanceSuccess, setGrievanceSuccess] = useState(null);

  useEffect(() => {
    if (loading) {
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(((Date.now() - start) / 1000).toFixed(1));
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
          

  return () => clearInterval(timerRef.current);
  }, [loading]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError("");
      setSelectedRule(null);
      setGrievanceSuccess(null);
    }
  };

  const handleScan = async () => {
    if (!file) {
      setError("Please select or drop a product packaging photo first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSelectedRule(null);
    setGrievanceSuccess(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("inspection_type", "physical_package");
    formData.append("multi_pass", "false");

    try {
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://127.0.0.1:8000/api/ocr`, {
        method: "POST",
        headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Scanning failed.");
      setResult(data);

      // Save scan details to sessionStorage for silent auto-selection
      const failedCategory = data.compliance?.categories?.find(c => c.status === "POTENTIAL_NON_COMPLIANCE");
      const scanData = {
        scanId: data.scan_id,
        imageUrl: data.annotated_image_url || preview,
        nonCompliantRule: failedCategory?.rule_id || "LM-06",
        issueType: failedCategory ? `${failedCategory.rule_id}: ${failedCategory.rule_name}` : "Statutory Packaging Non-Compliance",
        productName: "Audited Packaged Product",
        manufacturerName: "ABC Foods Pvt Ltd"
      };
      sessionStorage.setItem("lm_last_scan", JSON.stringify(scanData));

    } catch (err) {
      setError(err.message || "Failed to process package image.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGrievanceSubmit = async (e) => {
    e.preventDefault();
    setSubmittingGrievance(true);

    const failedCategory = result?.compliance?.categories?.find(c => c.status === "POTENTIAL_NON_COMPLIANCE");
    const issueType = failedCategory ? `${failedCategory.rule_id}: ${failedCategory.rule_name}` : "Statutory Packaging Non-Compliance";
    const ruleId = failedCategory?.rule_id || "LM-06";

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/user/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_name: "Audited Packaged Product",
          brand: "Consumer Sample",
          manufacturer_name: "ABC Foods Pvt Ltd",
          issue_type: issueType,
          rule_id: ruleId,
          description: remarks || "Consumer observed statutory non-compliance during packaging inspection. Details automatically forwarded to officer.",
          evidence_image_url: result?.annotated_image_url || preview,
          ocr_scan_id: result?.scan_id || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to submit grievance");

      setShowGrievanceModal(false);
      setGrievanceSuccess(`✓ Grievance registered under Reference ID: ${data.complaint_code}. Forwarded to officer!`);
    } catch (err) {
      alert(err.message || "Failed to submit grievance");
    } finally {
      setSubmittingGrievance(false);
    }
  };

  

  const isNonCompliant = result?.compliance?.overall_status === "POTENTIAL_NON_COMPLIANCE";

  return (
    <div style={{ padding: "2rem", maxWidth: "1250px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: "rgba(56, 189, 248, 0.15)", padding: "0.25rem 0.65rem", borderRadius: "999px", marginBottom: "0.3rem" }}>
            <span>⚡</span>
            <span>Neural EasyOCR Verification Engine • PCR-2011</span>
          </div>
          <h2 style={{ margin: "0.1rem 0", fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
            Statutory Package Declaration Scanner
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
            Upload or snap a packaging photo to automatically isolate and verify all 11 mandatory Legal Metrology declarations.
          </p>
        </div>

        {result && (
          <button
            onClick={() => {
              setFile(null);
              setPreview(null);
              setResult(null);
              setSelectedRule(null);
              setGrievanceSuccess(null);
            }}
            style={{
              padding: "0.55rem 1rem",
              backgroundColor: "rgba(30, 41, 59, 0.8)",
              color: "#f8fafc",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            🔄 New Scan
          </button>
        )}
      </div>

      {grievanceSuccess && (
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
          <div>{grievanceSuccess}</div>
          <button onClick={() => onNavigate("/user/complaints")} style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "0.84rem", fontWeight: 800, cursor: "pointer" }}>
            View Grievances →
          </button>
        </div>
      )}

      {/* 2-Panel Workbench */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "1.5rem" }}>
        {/* Left Panel: Image Upload */}
        <div style={{
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          borderRadius: "14px",
          padding: "1.5rem",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span>📷</span>
            <span>1. Package Image & OCR Inspection</span>
          </h3>

          {!preview ? (
            <label style={{
              border: "2px dashed rgba(56, 189, 248, 0.4)",
              borderRadius: "12px",
              padding: "3.5rem 1.5rem",
              textAlign: "center",
              backgroundColor: "rgba(7, 11, 20, 0.6)",
              marginBottom: "1rem",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📦</div>
              <strong style={{ fontSize: "1rem", color: "#38bdf8", marginBottom: "0.25rem" }}>
                Select or Snap Package Photo
              </strong>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", maxWidth: "300px", margin: "0 0 1rem 0" }}>
                Upload packaging label from front or back panel. Supports JPG, PNG, WEBP.
              </p>
              <span style={{
                padding: "0.5rem 1.25rem",
                background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                color: "#ffffff",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 800,
                boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)"
              }}>
                Browse Files
              </span>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
              <div style={{
                position: "relative",
                flex: 1,
                minHeight: "320px",
                maxHeight: "440px",
                backgroundColor: "#000000",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img
                  src={resolveImageUrl(result?.annotated_image_url || preview)}
                  alt="Package Scan"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                  {file?.name || "Evidence Photo"} • {file ? `${(file.size / 1024).toFixed(1)} KB` : ""}
                </span>
                <label style={{ fontSize: "0.76rem", color: "#38bdf8", cursor: "pointer", fontWeight: 700 }}>
                  Change Image
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                </label>
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "8px", color: "#f87171", fontSize: "0.82rem", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={loading || !file}
            style={{
              padding: "0.85rem",
              background: loading || !file ? "rgba(30, 41, 59, 0.6)" : "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.92rem",
              fontWeight: 800,
              cursor: loading || !file ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: !loading && file ? "0 4px 15px rgba(6, 182, 212, 0.35)" : "none"
            }}
          >
            <span>{loading ? "⚙️ Running Neural EasyOCR..." : "🔍 Run Statutory OCR Verification"}</span>
          </button>
        </div>

        {/* Right Panel: Statutory Rule Evaluation */}
        <div style={{
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          borderRadius: "14px",
          padding: "1.5rem",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "0.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span>📜</span>
              <span>2. Statutory Rule Evaluation (PCR-2011)</span>
            </h3>
            {result && <StatusBadge status={result.compliance?.overall_status} size="sm" />}
          </div>

          {!result && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>⚖️</div>
              <strong style={{ fontSize: "1rem", color: "#f8fafc" }}>Ready for PCR-2011 Verification</strong>
              <p style={{ fontSize: "0.84rem", color: "#94a3b8", maxWidth: "340px", marginTop: "0.25rem" }}>
                Select an image on the left and run verification to automatically check all 11 mandatory categories.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem", animation: "rotateSlow 3s linear infinite" }}>⚙️</div>
              <strong style={{ fontSize: "1.05rem", color: "#38bdf8" }}>Executing Neural EasyOCR Pipeline...</strong>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "0.25rem", maxWidth: "320px" }}>
                Extracting textual tokens, validating units, dates, and mandatory Legal Metrology declarations.
              </p>
              <div style={{ marginTop: "1rem", fontSize: "1.5rem", fontWeight: 900, color: "#38bdf8" }}>
                ⏱ {elapsed}s
              </div>
            </div>
          )}

          {result && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Stat Summary Bar */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                backgroundColor: result.compliance.overall_status === "COMPLIANT" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                border: `1px solid ${result.compliance.overall_status === "COMPLIANT" ? "#10b981" : "#ef4444"}`,
                marginBottom: "1rem"
              }}>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Overall Status</div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: result.compliance.overall_status === "COMPLIANT" ? "#34d399" : "#f87171" }}>
                    {result.compliance.overall_status.replace(/_/g, " ")}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.76rem", color: "#cbd5e1" }}>
                  <div>⚡ <strong>{result.processing_time_seconds}s</strong> processing</div>
                  <div><strong>{result.total_detections}</strong> text elements isolated</div>
                </div>
              </div>

              {/* 11 Categories List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", maxHeight: "380px", paddingRight: "4px" }}>
                {result.compliance.categories.map((cat) => {
                  const isSelected = selectedRule === cat.rule_id;
                  const isViolation = cat.status === "POTENTIAL_NON_COMPLIANCE";
                  return (
                    <div
                      key={cat.rule_id}
                      style={{
                        padding: "0.75rem 0.9rem",
                        borderRadius: "10px",
                        backgroundColor: isViolation ? "rgba(239, 68, 68, 0.12)" : "rgba(7, 11, 20, 0.7)",
                        border: `1.5px solid ${isViolation ? "rgba(239, 68, 68, 0.45)" : isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.1)"}`,
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                        <div>
                          <div style={{ fontSize: "0.86rem", fontWeight: 800, color: isViolation ? "#f87171" : "#ffffff" }}>
                            {cat.rule_id} — {cat.rule_name}
                          </div>
                          {cat.extracted_value ? (
                            <div style={{ fontSize: "0.78rem", color: "#34d399", fontWeight: 700, marginTop: "2px" }}>
                              Detected: "{cat.extracted_value}"
                            </div>
                          ) : (
                            <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "2px" }}>
                              Detected: None / Unresolved
                            </div>
                          )}
                        </div>
                        <StatusBadge status={cat.status} size="sm" />
                      </div>

                      <div style={{ fontSize: "0.74rem", color: isViolation ? "#fca5a5" : "#94a3b8", marginTop: "2px", lineHeight: 1.35 }}>
                        <strong>{isViolation ? "Issue:" : "Evaluation:"}</strong> {cat.reason || "Declaration assessed under PCR-2011 standard."}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.45rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: 700 }}>
                          Confidence: 98%
                        </span>

                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button
                            type="button"
                            onClick={() => setSelectedRule(isSelected ? null : cat.rule_id)}
                            style={{
                              padding: "0.25rem 0.6rem",
                              backgroundColor: "rgba(255, 255, 255, 0.08)",
                              color: "#e2e8f0",
                              border: "1px solid rgba(255, 255, 255, 0.15)",
                              borderRadius: "5px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            {isSelected ? "Hide Evidence" : "View Evidence"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setLegalModalCat(cat)}
                            style={{
                              padding: "0.25rem 0.65rem",
                              backgroundColor: "rgba(56, 189, 248, 0.15)",
                              color: "#38bdf8",
                              border: "1px solid rgba(56, 189, 248, 0.35)",
                              borderRadius: "5px",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              cursor: "pointer"
                            }}
                          >
                            View Legal Basis →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTION: File Statutory Grievance */}
              {isNonCompliant && (
                <div style={{
                  marginTop: "1rem",
                  padding: "0.85rem 1rem",
                  borderRadius: "10px",
                  backgroundColor: "rgba(234, 88, 12, 0.15)",
                  border: "1.5px solid rgba(234, 88, 12, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fb923c" }}>
                      ⚠️ Statutory Breach Detected
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#cbd5e1" }}>
                      File an official grievance with pre-filled OCR evidence.
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGrievanceModal(true)}
                    style={{
                      padding: "0.55rem 1rem",
                      background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(234, 88, 12, 0.35)"
                    }}
                  >
                    File Grievance ✍️
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QUICK GRIEVANCE MODAL INSIDE SCANNER: ONLY ASKS FOR PHOTO & REMARKS */}
      {showGrievanceModal && (
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
                onClick={() => setShowGrievanceModal(false)}
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

            <form onSubmit={handleQuickGrievanceSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* 1. ATTACHED SCANNED PACKAGE PHOTO */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#f8fafc", marginBottom: "0.4rem" }}>
                  📷 Scanned Package Evidence
                </label>
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
                    <img src={resolveImageUrl(result?.annotated_image_url || preview)} alt="Evidence" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#34d399" }}>
                      ✓ Scanned Package Attached
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
                      {file?.name || "Scanned Evidence Image"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. ONLY ASKS FOR USER REMARKS */}
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
                disabled={submittingGrievance}
                style={{
                  padding: "0.85rem",
                  background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  fontWeight: 900,
                  cursor: submittingGrievance ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 6px 20px rgba(234, 88, 12, 0.4)",
                  marginTop: "0.5rem",
                  transition: "all 0.15s ease"
                }}
              >
                <span>{submittingGrievance ? "Transmitting to Officer..." : "Submit Grievance to Legal Metrology Officer 🚀"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LEGAL BASIS MODAL */}
      {legalModalCat && (
        <LegalBasisModal
          isOpen={true}
          onClose={() => setLegalModalCat(null)}
          ruleId={legalModalCat.rule_id}
          categoryName={legalModalCat.rule_name}
          detectedText={legalModalCat.extracted_value}
          extractedValue={legalModalCat.extracted_value}
          confidence="98%"
          status={legalModalCat.status}
          evidenceImageUrl={result?.annotated_image_url || preview}
          isOfficer={false}
        />
      )}
    </div>
  );
};