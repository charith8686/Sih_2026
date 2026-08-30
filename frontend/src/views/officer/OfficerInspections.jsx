import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";

export const OfficerInspections = ({ onNavigate }) => {
  const { token } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [msg, setMsg] = useState(null);

  const fetchInspections = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/officer/inspections`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((d) => setInspections(d || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInspections();
  }, [token]);

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete inspection record "${code || id}"?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/officer/inspections/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMsg({ type: "success", text: `✓ Inspection ${code || id} deleted.` });
        if (selectedInspection?.id === id) setSelectedInspection(null);
        fetchInspections();
      } else {
        alert("Failed to delete inspection record.");
      }
    } catch (err) {
      alert("Failed to delete inspection record.");
    }
  };

  const filtered = inspections.filter((i) => {
    if (filterStatus === "ALL") return true;
    return i.status === filterStatus;
  });

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
            <span>📑</span>
            <span>Statutory Field Audits • PCR-2011</span>
          </div>
          <h2 style={{ margin: "0.1rem 0", fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
            Official Statutory Inspections (INS)
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
            Audited packaged commodity records under Legal Metrology Enforcement Framework.
          </p>
        </div>

        <button
          onClick={() => onNavigate("/officer/scan")}
          style={{
            padding: "0.65rem 1.3rem",
            background: "linear-gradient(135deg, #4338ca 0%, #1e3a8a 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.86rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.35)"
          }}
        >
          <span>🔍</span>
          <span>Perform New Inspection</span>
        </button>
      </div>

      {msg && (
        <div style={{
          padding: "0.85rem 1.25rem",
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          border: "1.5px solid #10b981",
          borderRadius: "8px",
          color: "#34d399",
          fontSize: "0.85rem",
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

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {["ALL", "Completed", "Under Review", "Escalated"].map((st) => {
          const isSelected = filterStatus === st;
          const count = st === "ALL" ? inspections.length : inspections.filter((i) => i.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: "0.45rem 0.9rem",
                fontSize: "0.8rem",
                fontWeight: isSelected ? 800 : 600,
                color: isSelected ? "#38bdf8" : "#94a3b8",
                backgroundColor: isSelected ? "rgba(56, 189, 248, 0.15)" : "rgba(15, 23, 42, 0.6)",
                border: isSelected ? "1.5px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isSelected ? "0 0 10px rgba(56, 189, 248, 0.25)" : "none"
              }}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Inspections Table */}
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
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Inspection ID</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Product & Manufacturer</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Mode</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Compliance Finding</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Violations</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Status</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((ins) => (
                <tr key={ins.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", transition: "background 0.15s ease" }}>
                  <td style={{ padding: "0.9rem 1.25rem", fontWeight: 800, color: "#38bdf8" }}>
                    {ins.inspection_code}
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <div style={{ fontWeight: 700, color: "#ffffff" }}>{ins.product_name}</div>
                    <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>{ins.manufacturer_name}</div>
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#cbd5e1" }}>
                    {ins.inspection_type === "physical_package" ? "📦 Physical" : "🌐 E-Commerce"}
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <StatusBadge status={ins.compliance_status} size="sm" />
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", color: ins.violations_count > 0 ? "#f87171" : "#34d399", fontWeight: 800 }}>
                    {ins.violations_count}
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#cbd5e1" }}>
                    <span style={{
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "999px",
                      backgroundColor: "rgba(56, 189, 248, 0.15)",
                      color: "#38bdf8",
                      border: "1px solid rgba(56, 189, 248, 0.3)"
                    }}>
                      {ins.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.45rem", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => setSelectedInspection(ins)}
                        style={{
                          padding: "0.4rem 0.85rem",
                          backgroundColor: "rgba(56, 189, 248, 0.15)",
                          color: "#38bdf8",
                          border: "1px solid rgba(56, 189, 248, 0.3)",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => handleDelete(ins.id, ins.inspection_code)}
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
                        title="Delete Inspection Record"
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
                    icon="📑"
                    title="No inspection records found"
                    description="Run your first inspection via the Statutory Scanner to generate inspection records."
                    actionText="Perform Inspection"
                    onAction={() => onNavigate("/officer/scan")}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* High-Contrast Dark Inspection Modal */}
      {selectedInspection && (
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
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Legal Metrology Audit Dossier
                </div>
                <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}>
                  Inspection Record: {selectedInspection.inspection_code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
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

            {/* High-Contrast Details Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Product Name</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>{selectedInspection.product_name}</div>
                </div>
                <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Manufacturer</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#38bdf8", marginTop: "2px" }}>{selectedInspection.manufacturer_name || "ABC Foods Pvt Ltd"}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Auditing Officer</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>{selectedInspection.officer_name || "Inspector"}</div>
                </div>
                <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Audit Date</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f8fafc", marginTop: "2px" }}>{formatDateOnly(selectedInspection.created_at)}</div>
                </div>
              </div>

              <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Compliance Finding</div>
                  <div style={{ marginTop: "4px" }}>
                    <StatusBadge status={selectedInspection.compliance_status} size="sm" />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Violation Count</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 900, color: selectedInspection.violations_count > 0 ? "#f87171" : "#34d399", marginTop: "2px" }}>
                    {selectedInspection.violations_count}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Inspector Remarks</div>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.84rem", color: "#cbd5e1", lineHeight: 1.45 }}>
                  {selectedInspection.officer_remarks || "Automated PCR-2011 audit via EasyOCR neural inspection pipeline."}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => handleDelete(selectedInspection.id, selectedInspection.inspection_code)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#f87171",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                🗑️ Delete Inspection
              </button>
              <button
                onClick={() => setSelectedInspection(null)}
                style={{
                  flex: 1.5,
                  padding: "0.75rem",
                  background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(6, 182, 212, 0.3)"
                }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};