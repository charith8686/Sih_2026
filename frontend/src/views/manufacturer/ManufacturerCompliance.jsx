import { resolveImageUrl } from "../../utils/imageUrl";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { LegalBasisModal } from "../../components/LegalBasisModal";

export const ManufacturerCompliance = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [selectedRule, setSelectedRule] = useState(null);
  const [legalModalCat, setLegalModalCat] = useState(null);

  // Product Save Form State
  const [prodName, setProdName] = useState("");
  const [prodBrand, setProdBrand] = useState("");
  const [prodCategory, setProdCategory] = useState("Packaged Food");
  const [prodPackSize, setProdPackSize] = useState("100 g");
  const [prodMrp, setProdMrp] = useState(50.0);
  const [prodBarcode, setProdBarcode] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

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
      setSaveSuccess("");
      setSelectedRule(null);
    }
  };

  const handleScan = async () => {
    if (!file) {
      setError("Please select packaging artwork or label image.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSaveSuccess("");
    setSelectedRule(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("inspection_type", "physical_package");
    formData.append("multi_pass", "false");

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/ocr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Scanning failed.");
      setResult(data);

      // Pre-populate product save fields from OCR findings
      const genCat = data.compliance.categories.find((c) => c.rule_id === "LM-02");
      const qtyCat = data.compliance.categories.find((c) => c.rule_id === "LM-03");
      const mrpCat = data.compliance.categories.find((c) => c.rule_id === "LM-06");

      setProdName(genCat?.extracted_value || file.name.replace(/\.[^/.]+$/, ""));
      setProdBrand(user?.company_name || "ABC Foods");
      setProdPackSize(qtyCat?.extracted_value || "100 g");

      if (mrpCat?.extracted_value) {
        const numMatch = mrpCat.extracted_value.match(/(\d+(?:\.\d{2})?)/);
        if (numMatch) setProdMrp(parseFloat(numMatch[1]));
      }
    } catch (err) {
      setError(err.message || "Failed to process label artwork.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!prodName) {
      alert("Please specify a product name.");
      return;
    }

    setSavingProduct(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/manufacturer/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: prodName,
          brand: prodBrand || user?.company_name || "ABC Foods",
          category: prodCategory,
          pack_size: prodPackSize,
          mrp: parseFloat(prodMrp || 0.0),
          barcode: prodBarcode,
          compliance_status: result?.compliance?.overall_status || "COMPLIANT",
          image_url: result?.annotated_image_url
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to save product.");
      setSaveSuccess(`✓ SKU Registered: ${data.product_code} (${data.name}) saved to company catalog.`);
    } catch (err) {
      alert(err.message || "Failed to save SKU");
    } finally {
      setSavingProduct(false);
    }
  };

  

  return (
    <div style={{ padding: "1.75rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#047857", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Pre-Market Statutory Verification Engine
          </div>
          <h2 style={{ margin: "0.2rem 0", fontSize: "1.45rem", fontWeight: 800, color: "#0f172a" }}>
            Pre-Market Packaging Compliance & SKU Registry
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
            Audit artwork proofs against Legal Metrology Rules, 2011 before commercial cylinder printing and batch production.
          </p>
        </div>

        <button
          onClick={() => onNavigate("/manufacturer/products")}
          style={{
            padding: "0.55rem 1rem",
            backgroundColor: "#ffffff",
            color: "#1e3a8a",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          📦 View Catalog SKUs
        </button>
      </div>

      {saveSuccess && (
        <div style={{
          padding: "1rem 1.25rem",
          backgroundColor: "#d1fae5",
          border: "1.5px solid #a7f3d0",
          borderRadius: "8px",
          color: "#065f46",
          fontSize: "0.88rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>{saveSuccess}</div>
          <button onClick={() => setSaveSuccess("")} style={{ background: "none", border: "none", color: "#065f46", fontSize: "1rem", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* 2-Panel Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "1.5rem" }}>
        {/* Left Panel: Artwork Upload & OCR Image */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          padding: "1.25rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span>🎨</span>
            <span>1. Packaging Artwork & Cylinder Proof</span>
          </h3>

          {!preview ? (
            <div style={{
              border: "2px dashed #cbd5e1",
              borderRadius: "8px",
              padding: "3rem 1.5rem",
              textAlign: "center",
              backgroundColor: "#f8fafc",
              marginBottom: "1rem",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔬</div>
              <strong style={{ fontSize: "0.95rem", color: "#0f172a", marginBottom: "0.25rem" }}>
                Select Artwork File
              </strong>
              <p style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "300px", margin: "0 0 1rem 0" }}>
                Upload packaging proof or pouch sample. Supports JPG, PNG, WEBP.
              </p>
              <input
                type="file"
                accept="image/*"
                id="mfg-scan-input"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label
                htmlFor="mfg-scan-input"
                style={{
                  padding: "0.6rem 1.25rem",
                  backgroundColor: "#047857",
                  color: "#ffffff",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(4,120,87,0.2)"
                }}
              >
                Browse Artwork File
              </label>
            </div>
          ) : (
            <div style={{
              backgroundColor: "#0f172a",
              borderRadius: "8px",
              padding: "0.5rem",
              textAlign: "center",
              minHeight: "280px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
              position: "relative",
              overflow: "hidden"
            }}>
              <img
                src={result?.annotated_image_url ? resolveImageUrl(result.annotated_image_url) : preview}
                alt="Packaging Artwork"
                style={{
                  maxHeight: "340px",
                  maxWidth: "100%",
                  borderRadius: "4px",
                  objectFit: "contain"
                }}
              />
              <div style={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                color: "#ffffff",
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                fontSize: "0.72rem",
                fontWeight: 600
              }}>
                {result?.annotated_image_url ? "⚡ Neural OCR Bounding Overlay" : "Pre-Market Proof"}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: "0.75rem",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              color: "#b91c1c",
              fontSize: "0.82rem",
              marginBottom: "1rem",
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          {preview && !result && (
            <button
              onClick={handleScan}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: loading ? "#94a3b8" : "#047857",
                color: "#ffffff",
                fontSize: "0.9rem",
                fontWeight: 800,
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(4,120,87,0.2)"
              }}
            >
              {loading ? `⏳ Analyzing Packaging Declarations (${elapsed}s)...` : "🔬 Audit Artwork Compliance"}
            </button>
          )}

          {result && (
            /* Save SKU to Catalog Form */
            <div style={{ marginTop: "0.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
              <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.6rem" }}>
                💾 Save Verified SKU to Company Catalog
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#475569" }}>Product Name</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.78rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#475569" }}>Brand</label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.78rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#475569" }}>Pack Size</label>
                  <input
                    type="text"
                    value={prodPackSize}
                    onChange={(e) => setProdPackSize(e.target.value)}
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.78rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, color: "#475569" }}>MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodMrp}
                    onChange={(e) => setProdMrp(e.target.value)}
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.78rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProduct}
                disabled={savingProduct}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  backgroundColor: "#1e3a8a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  cursor: savingProduct ? "not-allowed" : "pointer"
                }}
              >
                {savingProduct ? "Registering SKU..." : "Save SKU to Company Catalog ✓"}
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: Statutory 11 Rules Analysis */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          padding: "1.25rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span>📜</span>
              <span>2. Statutory PCR-2011 Verification Matrix</span>
            </h3>
            {result && <StatusBadge status={result.compliance?.overall_status} size="sm" />}
          </div>

          {!result && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏷️</div>
              <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>Pre-Market Packaging Verification</strong>
              <p style={{ fontSize: "0.82rem", color: "#64748b", maxWidth: "340px", marginTop: "0.25rem" }}>
                Select an artwork file on the left and click "Audit Artwork Compliance" to run statutory rule verification.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚙️</div>
              <strong style={{ fontSize: "1rem", color: "#047857" }}>Executing Pre-Market Analysis...</strong>
              <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.25rem", maxWidth: "320px" }}>
                Validating mandatory declarations, unit font height, and country of origin compliance.
              </p>
              <div style={{ marginTop: "1rem", fontSize: "1.4rem", fontWeight: 800, color: "#047857" }}>
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
                borderRadius: "6px",
                backgroundColor: result.compliance.overall_status === "COMPLIANT" ? "#ecfdf5" : "#fef2f2",
                border: `1px solid ${result.compliance.overall_status === "COMPLIANT" ? "#a7f3d0" : "#fecaca"}`,
                marginBottom: "1rem"
              }}>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Overall Status</div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: result.compliance.overall_status === "COMPLIANT" ? "#065f46" : "#991b1b" }}>
                    {result.compliance.overall_status.replace(/_/g, " ")}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.76rem", color: "#475569" }}>
                  <div>⚡ <strong>{result.processing_time_seconds}s</strong> processing</div>
                  <div><strong>{result.total_detections}</strong> text elements isolated</div>
                </div>
              </div>

              {/* 11 Categories List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", overflowY: "auto", maxHeight: "420px", paddingRight: "4px" }}>
                {result.compliance.categories.map((cat) => {
                  const isSelected = selectedRule === cat.rule_id;
                  const isViolation = cat.status === "POTENTIAL_NON_COMPLIANCE";
                  return (
                    <div
                      key={cat.rule_id}
                      onClick={() => setSelectedRule(isSelected ? null : cat.rule_id)}
                      style={{
                        padding: "0.65rem 0.85rem",
                        borderRadius: "6px",
                        backgroundColor: isViolation ? "#fff5f5" : "#f8fafc",
                        border: `1px solid ${isViolation ? "#fecaca" : isSelected ? "#93c5fd" : "#e2e8f0"}`,
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: isViolation ? "#991b1b" : "#0f172a" }}>
                            {cat.rule_id}: {cat.rule_name}
                          </div>
                          {cat.extracted_value && (
                            <div style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 700, marginTop: "2px" }}>
                              Detected: "{cat.extracted_value}"
                            </div>
                          )}
                        </div>
                        <StatusBadge status={cat.status} size="sm" />
                      </div>

                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "3px" }}>
                        {cat.reason}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.4rem" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLegalModalCat(cat);
                          }}
                          style={{
                            padding: "0.2rem 0.6rem",
                            backgroundColor: "rgba(5, 150, 105, 0.1)",
                            color: "#059669",
                            border: "1px solid #a7f3d0",
                            borderRadius: "4px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          View Legal Basis →
                        </button>
                      </div>

                      {isSelected && (
                        <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "0.74rem", color: "#334155" }}>
                          <div><strong>Statutory Source:</strong> {cat.statutory_reference || "PCR-2011 Rule Table I"}</div>
                          <div><strong>Confidence:</strong> {cat.confidence ? `${(cat.confidence * 100).toFixed(1)}%` : "High"}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW LEGAL BASIS MODAL */}
      {legalModalCat && (
        <LegalBasisModal
          isOpen={true}
          onClose={() => setLegalModalCat(null)}
          ruleId={legalModalCat.rule_id}
          categoryName={legalModalCat.rule_name}
          detectedText={legalModalCat.extracted_value}
          extractedValue={legalModalCat.extracted_value}
          confidence={legalModalCat.confidence ? `${(legalModalCat.confidence * 100).toFixed(1)}%` : "98.0%"}
          status={legalModalCat.status}
          evidenceImageUrl={result?.annotated_image_url || preview}
          isOfficer={false}
        />
      )}
    </div>
  );
};