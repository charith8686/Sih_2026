import { API_BASE_URL } from "../config";
import { resolveImageUrl } from "../utils/imageUrl";
﻿import React, { useState } from "react";
import { StatusBadge } from "./StatusBadge";

export const TAXONOMY_LEGAL_MAPPING = {
  "LM-01": {
    name: "Manufacturer / Packer / Importer Name & Address",
    statutory_rule: "Rule 6(1)(a) of Legal Metrology (Packaged Commodities) Rules, 2011",
    statutory_source: "Government of India • Department of Consumer Affairs",
    source_url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
    description: "Every pre-packaged commodity must clearly disclose the complete postal name and physical address of the manufacturer, packer, or importer.",
    ocr_logic: "Identifies phrases like 'Manufactured by', 'Packed by', 'Marketed by', 'Imported by', PIN code, and complete city/state address.",
    compliance_criteria: "Must be legible and state complete address with PIN code."
  },
  "LM-02": {
    name: "Common / Generic Name of Commodity",
    statutory_rule: "Rule 6(1)(b) of Legal Metrology (Packaged Commodities) Rules, 2011",
    statutory_source: "Government of India • Department of Consumer Affairs",
    source_url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
    description: "The generic or common name of the commodity contained in the package must be prominently declared on the principal display panel.",
    ocr_logic: "Detects generic nomenclature (e.g. 'Paneer', 'Butter Cookies', 'Atta', 'Edible Vegetable Oil').",
    compliance_criteria: "Must clearly identify product nature without misleading branding."
  },
  "LM-03": {
    name: "Net Quantity",
    statutory_rule: "Rule 6(1)(c) & Rule 12 of Legal Metrology (Packaged Commodities) Rules, 2011",
    statutory_source: "Government of India • Department of Consumer Affairs",
    source_url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
    description: "Net weight, volume, or measure of commodity in standard metric units (g, kg, ml, l, m, or numerical count).",
    ocr_logic: "Parses numeric magnitude followed by metric symbols (e.g. '500 g', '1 kg', '200 ml', '1 L').",
    compliance_criteria: "Must be in standard SI units; non-standard units (e.g. lbs, oz) or missing quantities require officer scrutiny."
  },
  "LM-04": {
    name: "Month & Year of Manufacture / Packing / Import",
    statutory_rule: "Rule 6(1)(d) of Legal Metrology (Packaged Commodities) Rules, 2011",
    statutory_source: "Government of India • Department of Consumer Affairs",
    source_url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
    description: "Clear declaration of the month and year in which the commodity is manufactured, pre-packed, or imported.",
    ocr_logic: "Identifies date formats (MM/YYYY, Mon-YYYY) associated with 'Mfg Date', 'Packed on', 'Pkd Date', etc.",
    compliance_criteria: "Month and year must be unambiguous and within valid temporal ranges."
  },
  "LM-05": {
    name: "Expiry / Use-by / Best-before",
    statutory_rule: "Rule 6(1)(da) of Legal Metrology (Packaged Commodities) Rules, 2011",
    statutory_source: "Department of Consumer Affairs & Applicable Statutory Rules",
    source_url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
    description: "Mandatory expiry or use-by declaration for commodities that may become unfit for human consumption after a period of time.",
    ocr_logic: "Scans for 'Best Before', 'Use By', 'Expiry Date', 'EXP', or period declarations ('X months from packaging').",
    compliance_criteria: "Must explicitly provide shelf-life guidance to the consumer."
  },
  "LM-06": {
    name: "Maximum Retail Price (MRP)",
    statutory_rule: "Rule 6(1)(e) of Legal Metrology (Packaged Commodities) Rules, 2011",
    statutory_source: "Government of India • Department of Consumer Affairs",
    source_url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
    description: "Maximum Retail Price inclusive of all taxes in Indian Rupees (e.g., 'MRP ₹xx.xx incl. of all taxes').",
    ocr_logic: "Extracts 'MRP ₹', 'Rs.', or 'Maximum Retail Price' along with 'incl. of all taxes'.",
    compliance_criteria: "MRP must be clearly printed without over-writing, smudging, or dual-pricing."
  },
  "LM-07": {
    name: "Unit Sale Price (USP)",
    statutory_rule: "Rule 6(1)(f) of Legal Metrology (Packaged Commodities) Amendment Rules, 2022/2023",
    statutory_source: "Legal Metrology Amendment Notifications (DCA)",
    source_url: "https://consumeraffairs.nic.in/legalmetrologyactsandrules/legal-metrology-packaged-commodities-amendment-rules-2023-2",
    description: "Unit Sale Price expressed in Rupees per gram/kg/ml/litre/number alongside MRP to facilitate price comparison.",
    ocr_logic: "Detects '₹ / g', '₹ / kg', '₹ / ml', '₹ / piece' or 'Unit Sale Price'.",
    compliance_criteria: "Mandatory on packaged commodities exceeding or fractional to single standard metric quantities."
  },
  "LM-08": {
    name: "Consumer Care Details",
    statutory_rule: "Rule 6(1)(n) of Legal Metrology (Packaged Commodities) Rules, 2011",
    statutory_source: "Government of India • Department of Consumer Affairs",
    source_url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
    description: "Name, postal address, telephone number, and email address of person/officer who can be contacted for consumer grievances.",
    ocr_logic: "Identifies 'Customer Care', contact telephone, toll-free number, and support email address.",
    compliance_criteria: "At least telephone number or email address along with contact designation must be provided."
  },
  "LM-09": {
    name: "Country of Origin",
    statutory_rule: "Rule 6(10) of Legal Metrology (Packaged Commodities) Rules, 2011",
    statutory_source: "Government of India • Department of Consumer Affairs",
    source_url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
    description: "Declaration of country of origin or manufacture on every imported or domestic package.",
    ocr_logic: "Scans for 'Country of Origin: India', 'Made in [Country]', 'Product of [Country]'.",
    compliance_criteria: "Must clearly declare origin country for consumer transparency."
  },
  "LM-10": {
    name: "Importer Name & Address",
    statutory_rule: "Rule 6(1)(a) of Legal Metrology (Packaged Commodities) Rules, 2011",
    statutory_source: "Government of India • Department of Consumer Affairs",
    source_url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
    description: "For imported goods, the complete postal name and address of the registered importer in India.",
    ocr_logic: "Detects 'Imported by', 'Marketed in India by' with registered Indian corporate postal address.",
    compliance_criteria: "Mandatory for all foreign-origin pre-packaged commodities."
  },
  "LM-11": {
    name: "E-commerce & Digital Mandatory Declarations",
    statutory_rule: "Rule 6(10) of PCR 2011 & Consumer Protection (E-Commerce) Rules, 2020",
    statutory_source: "Department of Consumer Affairs, Government of India",
    source_url: "https://consumeraffairs.nic.in/",
    description: "Digital marketplace platforms must display all statutory declarations on the digital product display panel prior to purchase.",
    ocr_logic: "Cross-checks digital listing metadata against statutory declaration standards.",
    compliance_criteria: "All mandatory packaging fields must be rendered to consumers before checkout."
  },
  "LM-SUPP-BATCH": {
    name: "Batch / Lot / Code Number",
    statutory_rule: "Supplementary statutory traceability provision under Packaged Commodities Rules",
    statutory_source: "Government of India • Department of Consumer Affairs",
    source_url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
    description: "Identification batch or lot code to facilitate manufacturing quality tracking and statutory recall.",
    ocr_logic: "Extracts 'Batch No', 'Lot No', 'B.No' alphanumeric codes.",
    compliance_criteria: "Traceability identifier must be legible."
  }
};

export const LegalBasisModal = ({
  isOpen,
  onClose,
  ruleId = "LM-06",
  categoryName,
  detectedText,
  extractedValue,
  confidence = "98%",
  status = "POTENTIAL_NON_COMPLIANCE",
  evidenceImageUrl,
  isOfficer = false,
  onOfficerFinding
}) => {
  const [officerFinding, setOfficerFinding] = useState(status);
  const [officerNotes, setOfficerNotes] = useState("");

  if (!isOpen) return null;

  // Resolve mapping from registry
  const mapping = TAXONOMY_LEGAL_MAPPING[ruleId] || {
    name: categoryName || "Mandatory Statutory Declaration",
    statutory_rule: "Rule 6 of Legal Metrology (Packaged Commodities) Rules, 2011",
    statutory_source: "Government of India • Department of Consumer Affairs",
    source_url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
    description: "Statutory mandatory declaration required on all pre-packaged commodities.",
    ocr_logic: "EasyOCR neural detection pipeline extracting text tokens.",
    compliance_criteria: "Must conform to standard Packaged Commodities Rules 2011 specifications."
  };

  

        

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(7, 11, 20, 0.85)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1100,
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "#0f172a",
        borderRadius: "16px",
        width: "650px",
        maxWidth: "94vw",
        maxHeight: "92vh",
        overflowY: "auto",
        padding: "2rem",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.25)",
        border: "1.5px solid rgba(56, 189, 248, 0.35)"
      }}>
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "0.85rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.74rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.04em", backgroundColor: "rgba(56, 189, 248, 0.15)", padding: "0.2rem 0.55rem", borderRadius: "999px", marginBottom: "0.25rem" }}>
              <span>⚖️</span>
              <span>Regulatory Basis & Statutory Reference</span>
            </div>
            <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.3rem", fontWeight: 900, color: "#ffffff" }}>
              {mapping.name}
            </h3>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "3px" }}>
              System Taxonomy ID: <strong style={{ color: "#38bdf8" }}>{ruleId}</strong> <span style={{ fontSize: "0.72rem", color: "#64748b" }}>(Internal System ID • Not an official rule number)</span>
            </div>
          </div>

          <button
            onClick={onClose}
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

        {/* Screening Result & Confidence Card */}
        <div style={{
          backgroundColor: "rgba(7, 11, 20, 0.6)",
          padding: "1rem",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              AI Screening Result
            </div>
            <div style={{ marginTop: "4px" }}>
              <StatusBadge status={status} size="md" />
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Neural OCR Confidence
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#34d399", marginTop: "2px" }}>
              {confidence}
            </div>
          </div>
        </div>

        {/* Detected Values Card */}
        <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Detected Text Token</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#ffffff", marginTop: "2px", fontFamily: "monospace" }}>
                "{detectedText || extractedValue || "N/A"}"
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Parsed Extracted Value</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#38bdf8", marginTop: "2px" }}>
                {extractedValue || detectedText || "No value extracted"}
              </div>
            </div>
          </div>

          {evidenceImageUrl && (
            <div style={{ marginTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.75rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                Evidence Image & OCR Bounding Box
              </div>
              <div style={{ height: "130px", backgroundColor: "#000", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={resolveImageUrl(evidenceImageUrl)} alt="Evidence Bounding Box" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
            </div>
          )}
        </div>

        {/* Regulatory Foundation Details */}
        <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "1.25rem", borderRadius: "10px", border: "1px solid rgba(56, 189, 248, 0.2)", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>
            📜 Statutory Foundation & Provision
          </div>

          <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.4rem" }}>
            {mapping.statutory_rule}
          </div>

          <div style={{ fontSize: "0.78rem", color: "#cbd5e1", lineHeight: 1.5, marginBottom: "0.85rem" }}>
            {mapping.description}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "0.85rem" }}>
            <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
              Source Authority: <strong style={{ color: "#ffffff" }}>{mapping.statutory_source}</strong>
            </div>

            <a
              href={mapping.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "0.45rem 0.9rem",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "6px",
                fontSize: "0.76rem",
                fontWeight: 800,
                textDecoration: "none",
                transition: "all 0.15s ease"
              }}
            >
              <span>VIEW OFFICIAL SOURCE</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* Officer Interactive Verification Option */}
        {isOfficer && (
          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.9)", padding: "1.25rem", borderRadius: "10px", border: "1.5px solid rgba(99, 102, 241, 0.4)", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
              👮 Official Inspector Adjudication
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.85rem" }}>
              {["COMPLIANT", "POTENTIAL_NON_COMPLIANCE", "REVIEW_REQUIRED"].map((st) => {
                const isSelected = officerFinding === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOfficerFinding(st)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "6px",
                      fontSize: "0.76rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      border: isSelected ? "1.5px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.1)",
                      backgroundColor: isSelected ? "rgba(56, 189, 248, 0.2)" : "rgba(7, 11, 20, 0.6)",
                      color: isSelected ? "#38bdf8" : "#94a3b8"
                    }}
                  >
                    [ {st.replace(/_/g, " ")} ]
                  </button>
                );
              })}
            </div>

            <textarea
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="Enter official statutory audit remarks..."
              rows={2}
              style={{
                width: "100%",
                padding: "0.6rem 0.8rem",
                backgroundColor: "rgba(7, 11, 20, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "0.82rem",
                boxSizing: "border-box",
                fontFamily: "inherit"
              }}
            />

            {onOfficerFinding && (
              <button
                type="button"
                onClick={() => {
                  onOfficerFinding({ finding: officerFinding, notes: officerNotes });
                  onClose();
                }}
                style={{
                  marginTop: "0.75rem",
                  width: "100%",
                  padding: "0.65rem",
                  background: "linear-gradient(135deg, #4338ca 0%, #1e3a8a 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.84rem",
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                Save Official Finding
              </button>
            )}
          </div>
        )}

        {/* AI Screening Disclaimer */}
        <div style={{
          backgroundColor: "rgba(234, 88, 12, 0.1)",
          border: "1px solid rgba(234, 88, 12, 0.25)",
          borderRadius: "8px",
          padding: "0.75rem 1rem",
          fontSize: "0.75rem",
          color: "#fed7aa",
          lineHeight: 1.45,
          marginBottom: "1.25rem"
        }}>
          ⚠️ <strong>AI-Assisted Screening Notice:</strong> AI-generated screening result — verify against the applicable current statutory provision. Final statutory determination rests with the authorized Legal Metrology Officer.
        </div>

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
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
          Close Regulatory Basis
        </button>
      </div>
    </div>
  );
};