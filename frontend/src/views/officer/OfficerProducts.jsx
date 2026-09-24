import { API_BASE_URL } from "../../config";
﻿import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";

export const OfficerProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/officer/products`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((d) => setProducts(d || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete product ${p.name} (${p.product_code})?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${p.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFeedback({ type: "success", text: `✓ Product ${p.product_code} deleted.` });
        fetchProducts();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.detail || "Failed to delete product.");
      }
    } catch (err) {
      alert("Network error deleting product.");
    }
  };

  const filtered = products.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term) ||
      p.manufacturer_name?.toLowerCase().includes(term) ||
      (p.barcode && p.barcode.includes(term))
    );
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "1250px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: "rgba(56, 189, 248, 0.15)", padding: "0.25rem 0.65rem", borderRadius: "999px", marginBottom: "0.3rem" }}>
            <span>📦</span>
            <span>National Packaged Commodity Database • PCR-2011</span>
          </div>
          <h2 style={{ margin: "0.1rem 0", fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
            Packaged Commodity Registry
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
            Central repository of statutory pre-packaged commodities across registered manufacturers.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search by product, brand, manufacturer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "320px",
            padding: "0.65rem 0.9rem",
            fontSize: "0.84rem",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            color: "#ffffff"
          }}
        />
      </div>

      {feedback && (
        <div style={{
          padding: "0.85rem 1.25rem",
          borderRadius: "10px",
          marginBottom: "1.25rem",
          backgroundColor: feedback.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
          border: `1.5px solid ${feedback.type === "success" ? "#10b981" : "#ef4444"}`,
          color: feedback.type === "success" ? "#34d399" : "#f87171",
          fontSize: "0.86rem",
          fontWeight: 700,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>{feedback.text}</div>
          <button onClick={() => setFeedback(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem" }}>✕</button>
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
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Product Name & Brand</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Category</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Manufacturer</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Pack Size</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>MRP</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700 }}>Status</th>
              <th style={{ padding: "0.85rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", transition: "background 0.15s ease" }}>
                  <td style={{ padding: "0.9rem 1.25rem", fontWeight: 800, color: "#38bdf8" }}>{p.product_code}</td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <div style={{ fontWeight: 700, color: "#ffffff" }}>{p.name}</div>
                    <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>{p.brand} • {p.barcode || "No Barcode"}</div>
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#cbd5e1" }}>{p.category}</td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#38bdf8", fontWeight: 600 }}>{p.manufacturer_name}</td>
                  <td style={{ padding: "0.9rem 1.25rem", color: "#94a3b8" }}>{p.pack_size}</td>
                  <td style={{ padding: "0.9rem 1.25rem", fontWeight: 800, color: "#34d399" }}>₹ {p.mrp?.toFixed(2) || "0.00"}</td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <StatusBadge status={p.compliance_status || "COMPLIANT"} size="sm" />
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(p)}
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
                      title="Delete Product"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ padding: "2rem" }}>
                  <EmptyState
                    icon="📦"
                    title="No products found"
                    description="No commodities match your current search criteria."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};