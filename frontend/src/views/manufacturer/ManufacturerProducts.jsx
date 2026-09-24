import { API_BASE_URL } from "../../config";
﻿import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";

export const ManufacturerProducts = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState(user?.company_name || "ABC Foods");
  const [category, setCategory] = useState("Packaged Food");
  const [packSize, setPackSize] = useState("100 g");
  const [mrp, setMrp] = useState(50.0);
  const [barcode, setBarcode] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchProducts = () => {
    fetch(`${API_BASE_URL}/api/manufacturer/products`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((d) => setProducts(d || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manufacturer/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          brand,
          category,
          pack_size: packSize,
          mrp: parseFloat(mrp),
          barcode,
          compliance_status: "COMPLIANT"
        })
      });
      if (!res.ok) throw new Error("Failed to add product");
      setShowModal(false);
      setName("");
      setMsg({ type: "success", text: "✓ New SKU registered in catalog." });
      fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete SKU "${code || id}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/manufacturer/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMsg({ type: "success", text: `✓ SKU ${code || id} deleted.` });
        fetchProducts();
      } else {
        alert("Failed to delete SKU.");
      }
    } catch (err) {
      alert("Failed to delete SKU.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1250px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", fontWeight: 800, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: "rgba(52, 211, 153, 0.15)", padding: "0.25rem 0.65rem", borderRadius: "999px", marginBottom: "0.3rem" }}>
            <span>🏭</span>
            <span>Enterprise Packaging Catalog • PCR-2011</span>
          </div>
          <h2 style={{ margin: "0.1rem 0", fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
            {user?.company_name || "ABC Foods"} Product Catalog
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
            Registered commodity packaging SKUs for your manufacturing facility.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => onNavigate("/manufacturer/compliance")}
            style={{
              padding: "0.65rem 1.1rem",
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "8px",
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            🔬 Scan Artwork & Save
          </button>

          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "0.65rem 1.3rem",
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.86rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(5, 150, 105, 0.4)"
            }}
          >
            + Add SKU Manually
          </button>
        </div>
      </div>

      {msg && (
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
          <div>{msg.text}</div>
          <button onClick={() => setMsg(null)} style={{ background: "none", border: "none", color: "inherit", fontSize: "1rem", cursor: "pointer" }}>✕</button>
        </div>
      )}

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
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>SKU Code</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Product Name</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Category</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Pack Size</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>MRP</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Compliance</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", transition: "background 0.15s ease" }}>
                  <td style={{ padding: "0.9rem 1.25rem", fontWeight: 800, color: "#38bdf8" }}>{p.product_code}</td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <div style={{ fontWeight: 700, color: "#ffffff" }}>{p.name}</div>
                    <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>{p.brand} • {p.barcode || "No Barcode"}</div>
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#cbd5e1" }}>{p.category}</td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#94a3b8" }}>{p.pack_size}</td>
                  <td style={{ padding: "0.9rem 1.25rem", fontWeight: 800, color: "#34d399" }}>₹ {p.mrp?.toFixed(2) || "0.00"}</td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <StatusBadge status={p.compliance_status || "COMPLIANT"} size="sm" />
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(p.id, p.product_code)}
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
                      title="Delete SKU"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: "2rem" }}>
                  <EmptyState
                    icon="📦"
                    title="No products registered yet"
                    description="Add your first SKU manually or perform a pre-market artwork scan."
                    actionText="+ Add SKU"
                    onAction={() => setShowModal(true)}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add SKU Modal */}
      {showModal && (
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
            width: "500px",
            maxWidth: "94vw",
            padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(52, 211, 153, 0.25)",
            border: "1.5px solid rgba(52, 211, 153, 0.35)"
          }}>
            <h3 style={{ margin: "0 0 1.25rem 0", fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}>
              Add Product SKU to Catalog
            </h3>

            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.3rem" }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Malai Paneer 200g"
                  required
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.8rem",
                    backgroundColor: "rgba(7, 11, 20, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.86rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.3rem" }}>
                    Pack Size *
                  </label>
                  <input
                    type="text"
                    value={packSize}
                    onChange={(e) => setPackSize(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.8rem",
                      backgroundColor: "rgba(7, 11, 20, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.86rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.3rem" }}>
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.8rem",
                      backgroundColor: "rgba(7, 11, 20, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.86rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1.5,
                    padding: "0.75rem",
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 800,
                    cursor: saving ? "not-allowed" : "pointer"
                  }}
                >
                  {saving ? "Registering..." : "Save SKU"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};