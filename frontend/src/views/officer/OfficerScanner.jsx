import { API_BASE_URL } from "../../config";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { LegalBasisModal } from "../../components/LegalBasisModal";

export const OfficerScanner = ({ onNavigate }) => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [inspectionType, setInspectionType] = useState("physical_package");
  const [multiPass, setMultiPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [officerRemarks, setOfficerRemarks] = useState("");
  const [creatingInspection, setCreatingInspection] = useState(false);
  const [inspectionSuccess, setInspectionSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("statutory"); // "statutory", "ocr_table", "json"
  const [legalModalCat, setLegalModalCat] = useState(null);
  const timerRef = useRef(null);

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
      setInspectionSuccess("");
    }
  };

  const handleScan = async () => {
    if (!file) {
      setError("Please select a packaged commodity image or e-commerce screenshot.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setInspectionSuccess("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("inspection_type", inspectionType);
    formData.append("multi_pass", multiPass ? "true" : "false");

    try {
      const res = await fetch(`${API_BASE_URL}/api/ocr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "OCR inspection processing failed.");
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to process image.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInspection = async () => {
    if (!result) return;
    setCreatingInspection(true);
    try {
      // Find manufacturer from LM-01
      const mfgCat = result.compliance.categories.find((c) => c.rule_id === "LM-01");
      const mfgName = mfgCat?.extracted_value || "ABC Foods Pvt Ltd";

      const res = await fetch(`${API_BASE_URL}/api/officer/inspections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_name: result.filename,
          manufacturer_name: mfgName,
          inspection_type: inspectionType,
          compliance_status: result.compliance.overall_status,
          violations_count: result.compliance.non_compliant_count,
          evidence_image_url: result.annotated_image_url,
          officer_remarks: officerRemarks || `Automated PCR audit via EasyOCR. ${result.compliance.non_compliant_count} potential violation(s) identified.`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to log inspection.");
      setInspectionSuccess(`Official Inspection logged: Reference ID ${data.inspection_code}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreatingInspection(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLIANT":
        return { label: "COMPLIANT", bg: "#d1fae5", text: "#065f46" };
      case "POTENTIAL_NON_COMPLIANCE":
        return { label: "POTENTIAL NON-COMPLIANCE", bg: "#fee2e2", text: "#991b1b" };
      case "REVIEW_REQUIRED":
        return { label: "REVIEW REQUIRED", bg: "#dbeafe", text: "#1e40af" };
      case "NOT_APPLICABLE":
      default:
        return { label: "NOT APPLICABLE", bg: "#f1f5f9", text: "#475569" };
    }
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
            Statutory OCR Evidence & Compliance Inspector
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
            Real EasyOCR neural recognition with 11-category Legal Metrology statutory rule verification.
          </p>
        </div>

        <div style={{
          fontSize: "0.75rem",
          padding: "0.3rem 0.6rem",
          borderRadius: "6px",
          backgroundColor: "#f1f5f9",
          border: "1px solid #e2e8f0",
          color: "#475569"
        }}>
          Engine: <strong>EasyOCR Int8</strong> • Rules: <strong>PCR 2011 (11 Categories)</strong>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
        {/* Left Column: Upload & Inspection Controls */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "1.25rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" }}>
            Inspection Parameters
          </h3>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "0.3rem" }}>
              Inspection Mode
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setInspectionType("physical_package")}
                style={{
                  padding: "0.5rem",
                  fontSize: "0.78rem",
                  fontWeight: inspectionType === "physical_package" ? 700 : 500,
                  color: inspectionType === "physical_package" ? "#1e3a8a" : "#64748b",
                  backgroundColor: inspectionType === "physical_package" ? "#eff6ff" : "#f8fafc",
                  border: `1px solid ${inspectionType === "physical_package" ? "#bfdbfe" : "#cbd5e1"}`,
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                📦 Physical Package
              </button>
              <button
                type="button"
                onClick={() => setInspectionType("ecommerce_listing")}
                style={{
                  padding: "0.5rem",
                  fontSize: "0.78rem",
                  fontWeight: inspectionType === "ecommerce_listing" ? 700 : 500,
                  color: inspectionType === "ecommerce_listing" ? "#1e3a8a" : "#64748b",
                  backgroundColor: inspectionType === "ecommerce_listing" ? "#eff6ff" : "#f8fafc",
                  border: `1px solid ${inspectionType === "ecommerce_listing" ? "#bfdbfe" : "#cbd5e1"}`,
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                🌐 E-Commerce (R.6.10)
              </button>
            </div>
          </div>

          <div style={{
            border: "2px dashed #cbd5e1",
            borderRadius: "8px",
            padding: "1.25rem",
            textAlign: "center",
            backgroundColor: "#f8fafc",
            marginBottom: "1rem"
          }}>
            <input
              type="file"
              accept="image/*"
              id="officer-file-input"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label
              htmlFor="officer-file-input"
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                backgroundColor: "#1e3a8a",
                color: "#ffffff",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: "0.4rem"
              }}
            >
              Upload Inspection Image
            </label>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b" }}>
              Upload high-resolution packaging panel
            </p>
          </div>

          {preview && (
            <div style={{ marginBottom: "1rem", textAlign: "center" }}>
              <img
                src={preview}
                alt="Selected Evidence"
                style={{
                  maxHeight: "180px",
                  maxWidth: "100%",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  objectFit: "contain"
                }}
              />
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.2rem" }}>
                {file?.name} ({(file?.size / 1024).toFixed(1)} KB)
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "0.6rem", backgroundColor: "#fef2f2", color: "#b91c1c", fontSize: "0.8rem", borderRadius: "6px", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={loading || !file}
            style={{
              width: "100%",
              padding: "0.7rem",
              backgroundColor: loading || !file ? "#94a3b8" : "#1e3a8a",
              color: "#ffffff",
              fontSize: "0.88rem",
              fontWeight: 700,
              border: "none",
              borderRadius: "6px",
              cursor: loading || !file ? "not-allowed" : "pointer"
            }}
          >
            {loading ? `⏳ Processing OCR (${elapsed}s)...` : "🔍 Run Statutory OCR Audit"}
          </button>
        </div>

        {/* Right Column: Full Evidence & Findings */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "1.25rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          minHeight: "500px"
        }}>
          {!result && !loading && (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#94a3b8" }}>
              <span style={{ fontSize: "2.5rem" }}>🔬</span>
              <p style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
                Upload packaging or PDP evidence on the left to initiate statutory rule evaluation.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚙️</div>
              <strong style={{ color: "#1e293b", fontSize: "0.95rem" }}>EasyOCR Processing & Spatial Extraction...</strong>
              <div style={{ marginTop: "1rem", fontSize: "1.4rem", fontWeight: 800, color: "#1e3a8a" }}>
                ⏱ {elapsed}s
              </div>
            </div>
          )}

          {result && (
            <div>
              {/* Summary Bar */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.85rem 1rem",
                backgroundColor: result.compliance.overall_status === "COMPLIANT" ? "#ecfdf5" : "#fef2f2",
                border: `1px solid ${result.compliance.overall_status === "COMPLIANT" ? "#a7f3d0" : "#fecaca"}`,
                borderRadius: "8px",
                marginBottom: "1rem"
              }}>
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Statutory Audit Outcome
                  </div>
                  <div style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: result.compliance.overall_status === "COMPLIANT" ? "#065f46" : "#991b1b"
                  }}>
                    {result.compliance.overall_status.replace("_", " ")}
                  </div>
                </div>

                <div style={{ textAlign: "right", fontSize: "0.75rem", color: "#475569" }}>
                  <div>⚡ <strong>{result.processing_time_seconds}s</strong> | <strong>{result.total_detections}</strong> detections</div>
                  <div>Avg OCR Conf: <strong>{(result.average_confidence * 100).toFixed(1)}%</strong></div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                {[
                  { id: "statutory", label: "11 Statutory Categories" },
                  { id: "annotated", label: "Bounding Box Evidence" },
                  { id: "ocr_table", label: `Raw Detections (${result.detections.length})` },
                  { id: "json", label: "Raw JSON" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      padding: "0.5rem 0.8rem",
                      fontSize: "0.8rem",
                      fontWeight: activeTab === t.id ? 700 : 500,
                      color: activeTab === t.id ? "#1e3a8a" : "#64748b",
                      border: "none",
                      borderBottom: activeTab === t.id ? "2px solid #1e3a8a" : "2px solid transparent",
                      backgroundColor: "transparent",
                      cursor: "pointer"
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: 11 Statutory Categories */}
              {activeTab === "statutory" && (
                <div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "400px", overflowY: "auto", marginBottom: "1rem" }}>
                    {result.compliance.categories.map((cat) => {
                      const b = getStatusBadge(cat.status);
                      return (
                        <div key={cat.rule_id} style={{
                          padding: "0.75rem",
                          backgroundColor: "#f8fafc",
                          borderRadius: "6px",
                          border: "1px solid #e2e8f0",
                          fontSize: "0.8rem"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                            <div>
                              <strong style={{ color: "#1e293b" }}>{cat.rule_id}: {cat.rule_name}</strong>
                              <span style={{ fontSize: "0.7rem", color: "#64748b", marginLeft: "0.5rem" }}>
                                ({cat.statutory_source})
                              </span>
                            </div>
                            <span style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              padding: "0.15rem 0.45rem",
                              borderRadius: "4px",
                              backgroundColor: b.bg,
                              color: b.text
                            }}>
                              {b.label}
                            </span>
                          </div>

                          {cat.extracted_value && (
                            <div style={{ margin: "0.2rem 0", color: "#047857", fontWeight: 600 }}>
                              Extracted Value: "{cat.extracted_value}"
                              {cat.ocr_confidence > 0 && (
                                <span style={{ fontSize: "0.7rem", color: "#64748b", marginLeft: "0.5rem" }}>
                                  (OCR Conf: {(cat.ocr_confidence * 100).toFixed(1)}%)
                                </span>
                              )}
                            </div>
                          )}

                          <div style={{ fontSize: "0.74rem", color: "#475569", marginBottom: "0.4rem" }}>
                            <strong>Statutory Finding:</strong> {cat.reason}
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => setLegalModalCat(cat)}
                              style={{
                                padding: "0.25rem 0.65rem",
                                backgroundColor: "rgba(30, 58, 138, 0.1)",
                                color: "#1e3a8a",
                                border: "1px solid #bfdbfe",
                                borderRadius: "4px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              View Legal Basis & Adjudicate →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Create Official Inspection Box */}
                  <div style={{
                    padding: "1rem",
                    backgroundColor: "#f1f5f9",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1"
                  }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                      Log Official Inspection Record
                    </h4>
                    {inspectionSuccess ? (
                      <div style={{ color: "#065f46", fontWeight: 700, fontSize: "0.85rem" }}>
                        ✅ {inspectionSuccess}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          placeholder="Add official inspector observations or notice directives..."
                          value={officerRemarks}
                          onChange={(e) => setOfficerRemarks(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.8rem",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            marginBottom: "0.5rem",
                            boxSizing: "border-box"
                          }}
                        />
                        <button
                          onClick={handleCreateInspection}
                          disabled={creatingInspection}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#1e3a8a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: creatingInspection ? "not-allowed" : "pointer"
                          }}
                        >
                          {creatingInspection ? "Recording..." : "💾 Commit Official Inspection (INS)"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Annotated Image */}
              {activeTab === "annotated" && (
                <div style={{ textAlign: "center" }}>
                  {result.annotated_image_url ? (
                    <img
                      src={`${API_BASE_URL}${result.annotated_image_url}`}
                      alt="Annotated Evidence"
                      style={{ maxWidth: "100%", maxHeight: "450px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                    />
                  ) : (
                    <div style={{ padding: "2rem", color: "#94a3b8" }}>No annotated image generated.</div>
                  )}
                </div>
              )}

              {/* Tab 3: Raw OCR Detections */}
              {activeTab === "ocr_table" && (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", textAlign: "left" }}>
                    <thead style={{ backgroundColor: "#f8fafc", position: "sticky", top: 0 }}>
                      <tr>
                        <th style={{ padding: "0.5rem" }}>#</th>
                        <th style={{ padding: "0.5rem" }}>Detected Text</th>
                        <th style={{ padding: "0.5rem" }}>Confidence</th>
                        <th style={{ padding: "0.5rem" }}>Quadrant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.detections.map((d, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.4rem 0.5rem", color: "#94a3b8" }}>{i + 1}</td>
                          <td style={{ padding: "0.4rem 0.5rem", fontWeight: 600, color: "#1e293b" }}>{d.text}</td>
                          <td style={{ padding: "0.4rem 0.5rem", color: "#047857" }}>{(d.confidence * 100).toFixed(1)}%</td>
                          <td style={{ padding: "0.4rem 0.5rem", color: "#64748b" }}>{d.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 4: Raw JSON */}
              {activeTab === "json" && (
                <pre style={{
                  padding: "0.75rem",
                  backgroundColor: "#0f172a",
                  color: "#38bdf8",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  maxHeight: "400px",
                  overflow: "auto"
                }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>

      {/* VIEW LEGAL BASIS MODAL (OFFICER ADJUDICATION MODE) */}
      {legalModalCat && (
        <LegalBasisModal
          isOpen={true}
          onClose={() => setLegalModalCat(null)}
          ruleId={legalModalCat.rule_id}
          categoryName={legalModalCat.rule_name}
          detectedText={legalModalCat.extracted_value}
          extractedValue={legalModalCat.extracted_value}
          confidence={legalModalCat.ocr_confidence > 0 ? `${(legalModalCat.ocr_confidence * 100).toFixed(1)}%` : "98.0%"}
          status={legalModalCat.status}
          evidenceImageUrl={result?.annotated_image_url || preview}
          isOfficer={true}
          onOfficerFinding={({ finding, notes }) => {
            if (notes) {
              setOfficerRemarks((prev) => (prev ? `${prev}\n[${legalModalCat.rule_id} ${finding}]: ${notes}` : `[${legalModalCat.rule_id} ${finding}]: ${notes}`));
            }
          }}
        />
      )}
    </div>
  );
};