import React from "react";

export const UserReports = () => {
  return (
    <div style={{ padding: "1.5rem", maxWidth: "900px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
          Consumer Advisory & Statutory Guide
        </h2>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
          Essential rights and mandatory declarations under Legal Metrology (Packaged Commodities) Rules, 2011.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "1.25rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", fontWeight: 700, color: "#1e3a8a" }}>
            The 11 Mandatory Packaging Declarations
          </h3>
          <p style={{ margin: "0 0 1rem 0", fontSize: "0.82rem", color: "#475569" }}>
            Under Rule 6 of PCR 2011, every pre-packaged commodity sold in India must display:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.8rem", color: "#334155" }}>
            <div style={{ padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>1. Manufacturer / Packer:</strong> Name & complete address with postal PIN.
            </div>
            <div style={{ padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>2. Generic Commodity Name:</strong> Standard trade / common description.
            </div>
            <div style={{ padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>3. Net Quantity:</strong> Standard metric unit (g, kg, ml, l, count).
            </div>
            <div style={{ padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>4. Date of Packing/Mfg:</strong> Month & Year (MM/YYYY).
            </div>
            <div style={{ padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>5. Expiry / Best Before:</strong> Period for consumable goods.
            </div>
            <div style={{ padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>6. MRP:</strong> "₹ XX.XX (inclusive of all taxes)".
            </div>
            <div style={{ padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>7. Unit Sale Price (USP):</strong> Price per g/kg/ml/l if package exceeds 100g/ml.
            </div>
            <div style={{ padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>8. Consumer Care:</strong> Phone, email & grievance address.
            </div>
            <div style={{ padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>9. Country of Origin:</strong> Mandatory for imported goods.
            </div>
            <div style={{ padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>10. Importer Details:</strong> Mandatory for imported goods.
            </div>
            <div style={{ gridColumn: "span 2", padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <strong>11. Digital E-Commerce Rule 6(10):</strong> Mandatory display of origin and declarations on online product display pages.
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: "#eff6ff",
          borderRadius: "8px",
          padding: "1.25rem",
          border: "1px solid #bfdbfe",
          color: "#1e3a8a",
          fontSize: "0.82rem"
        }}>
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", fontWeight: 700 }}>
            Consumer Protection Disclaimer:
          </h4>
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            This AI-assisted screening tool is intended for consumer awareness and grievance generation. Statutory enforcement inspections are conducted exclusively by authorized Legal Metrology officers under the Legal Metrology Act, 2009.
          </p>
        </div>
      </div>
    </div>
  );
};
