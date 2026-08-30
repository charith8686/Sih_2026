import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { TAXONOMY_LEGAL_MAPPING, LegalBasisModal } from "../components/LegalBasisModal";

export const LegalAdvisoryView = ({ onNavigate }) => {
  const { user } = useAuth();
  const role = user?.role || "user";

  const [activePerspective, setActivePerspective] = useState(() => {
    if (role === "officer") return "officer";
    if (role === "manufacturer") return "manufacturer";
    return "consumer";
  });

  const [sourceSearch, setSourceSearch] = useState("");
  const [modalCategory, setModalCategory] = useState(null);

  const officialSources = [
    {
      id: 1,
      title: "Legal Metrology Act, 2009",
      organization: "India Code — Government of India",
      description: "Official statutory repository containing the primary Legal Metrology Act, 2009 establishing metric standards and enforcement authority.",
      url: "https://www.indiacode.nic.in/handle/123456789/14044",
      buttonText: "VIEW OFFICIAL SOURCE",
      tag: "Primary Legislation"
    },
    {
      id: 2,
      title: "Legal Metrology (Packaged Commodities) Rules",
      organization: "Department of Consumer Affairs, Government of India",
      description: "Official Department of Consumer Affairs resource detailing all mandatory packaged commodity declarations under PCR-2011.",
      url: "https://consumeraffairs.nic.in/taxonomy/term/2645",
      buttonText: "VIEW OFFICIAL SOURCE",
      tag: "Statutory Rules"
    },
    {
      id: 3,
      title: "Department of Consumer Affairs — Legal Metrology",
      organization: "Government of India",
      description: "Official portal containing Legal Metrology rules, notifications, circulars, amendments, and enforcement guidelines.",
      url: "https://consumeraffairs.nic.in/",
      buttonText: "VIEW OFFICIAL SOURCE",
      tag: "Government Portal"
    },
    {
      id: 4,
      title: "Legal Metrology (Packaged Commodities) Amendment Rules, 2023",
      organization: "Department of Consumer Affairs, Government of India",
      description: "Statutory amendments governing Unit Sale Price (USP), electronic declarations, and standardized packaging parameters.",
      url: "https://consumeraffairs.nic.in/legalmetrologyactsandrules/legal-metrology-packaged-commodities-amendment-rules-2023-2",
      buttonText: "VIEW AMENDMENT",
      tag: "Amendment 2023"
    },
    {
      id: 5,
      title: "Legal Metrology (Packaged Commodities) Amendment Rules, 2022",
      organization: "Department of Consumer Affairs, Government of India",
      description: "Enacted amendments specifying unit sale price calculations, font height specifications, and metric unit harmonizations.",
      url: "https://consumeraffairs.nic.in/latestnews/legal-metrology-packaged-commodities-amendment-amendment-rules-2022",
      buttonText: "VIEW AMENDMENT",
      tag: "Amendment 2022"
    },
    {
      id: 6,
      title: "Official Legal Metrology Gazette / Notification",
      organization: "Department of Consumer Affairs",
      description: "Official published PDF Gazette notification of the Legal Metrology (Packaged Commodities) Rules.",
      url: "https://consumeraffairs.nic.in/sites/default/files/uploads/legal-metrology-acts-rules/PCR.pdf",
      buttonText: "VIEW OFFICIAL DOCUMENT",
      tag: "Gazette Notification"
    }
  ];

  const filteredSources = officialSources.filter(s =>
    s.title.toLowerCase().includes(sourceSearch.toLowerCase()) ||
    s.organization.toLowerCase().includes(sourceSearch.toLowerCase()) ||
    s.description.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const consumerChecklistCards = [
    {
      title: "Manufacturer / Packer Details",
      rule: "Rule 6(1)(a)",
      lookFor: "Complete registered legal name and physical postal address with PIN code.",
      whyItMatters: "Enables consumer accountability, product origin verification, and legal recourse in case of defects.",
      icon: "🏢"
    },
    {
      title: "Generic Product Name",
      rule: "Rule 6(1)(b)",
      lookFor: "Common or generic name prominently placed on the front principal display panel.",
      whyItMatters: "Prevents deceptive trade practices where branding masks the true nature or contents of the food/goods.",
      icon: "🏷️"
    },
    {
      title: "Net Quantity & Metric Unit",
      rule: "Rule 6(1)(c) & Rule 12",
      lookFor: "Weight, volume, or count in standard metric units (g, kg, ml, L).",
      whyItMatters: "Ensures fair measurement; non-standard units (e.g., lbs, oz) or short-measure packaging are statutory offenses.",
      icon: "⚖️"
    },
    {
      title: "MRP & Unit Sale Price (USP)",
      rule: "Rule 6(1)(e) & (f)",
      lookFor: "Maximum Retail Price 'inclusive of all taxes' plus Unit Sale Price (e.g. ₹ / g or ₹ / ml).",
      whyItMatters: "Protects consumers from over-charging and allows fair price comparison across different pack sizes.",
      icon: "💰"
    },
    {
      title: "Date Information & Expiry",
      rule: "Rule 6(1)(d) & (da)",
      lookFor: "Month & Year of packing/manufacture plus unambiguous Best Before or Expiry date.",
      whyItMatters: "Guarantees freshness, safety, and ensures consumers do not consume expired commodities.",
      icon: "📅"
    },
    {
      title: "Consumer Care Contacts",
      rule: "Rule 6(1)(n)",
      lookFor: "Toll-free telephone number, email ID, and postal address of customer grievance officer.",
      whyItMatters: "Mandates direct corporate accessibility for consumer assistance and quality claims.",
      icon: "📞"
    },
    {
      title: "Country of Origin",
      rule: "Rule 6(10)",
      lookFor: "Clear declaration of country of manufacture on all domestic and imported goods.",
      whyItMatters: "Ensures consumer transparency and statutory compliance under trade disclosure rules.",
      icon: "🌐"
    },
    {
      title: "Other Mandatory Declarations",
      rule: "Rule 6 / E-Commerce Rules",
      lookFor: "Batch / lot code, barcode, and full digital declaration display on e-commerce product pages.",
      whyItMatters: "Enables product traceability, lot identification during recalls, and fair digital commerce.",
      icon: "📦"
    }
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: "1250px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.76rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em", backgroundColor: "rgba(56, 189, 248, 0.15)", padding: "0.25rem 0.65rem", borderRadius: "999px", marginBottom: "0.4rem" }}>
          <span>⚖️</span>
          <span>STATUTORY REGULATORY FRAMEWORK</span>
        </div>
        <h1 style={{ margin: "0.1rem 0", fontSize: "1.85rem", fontWeight: 900, color: "#ffffff", letterSpacing: "0.02em" }}>
          LEGAL ADVISORY
        </h1>
        <p style={{ margin: 0, fontSize: "0.92rem", color: "#94a3b8" }}>
          Regulatory basis and reference sources used by the AI-assisted compliance system
        </p>
      </div>

      {/* Prominent Information Banner */}
      <div style={{
        backgroundColor: "rgba(30, 58, 138, 0.25)",
        border: "1.5px solid rgba(56, 189, 248, 0.4)",
        borderRadius: "12px",
        padding: "1rem 1.25rem",
        marginBottom: "1.75rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
      }}>
        <div style={{ fontSize: "1.6rem" }}>ℹ️</div>
        <div style={{ fontSize: "0.85rem", color: "#e2e8f0", lineHeight: 1.5 }}>
          <strong style={{ color: "#38bdf8" }}>IMPORTANT:</strong> This application provides AI-assisted compliance screening and evidence organization. Final statutory interpretation, verification and enforcement decisions remain with authorized Legal Metrology authorities.
        </div>
      </div>

      {/* Perspective Switcher Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        {[
          { id: "consumer", label: "Consumer Perspective", icon: "👤" },
          { id: "officer", label: "Legal Metrology Officer", icon: "🛡️" },
          { id: "manufacturer", label: "Manufacturer Perspective", icon: "🏢" },
          { id: "taxonomy", label: "Regulatory Taxonomy (LM-01 to LM-11)", icon: "📜" }
        ].map((tab) => {
          const isSelected = activePerspective === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePerspective(tab.id)}
              style={{
                padding: "0.6rem 1.15rem",
                borderRadius: "8px",
                fontSize: "0.84rem",
                fontWeight: isSelected ? 800 : 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.15s ease",
                border: isSelected ? "1.5px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: isSelected ? "rgba(56, 189, 248, 0.2)" : "rgba(15, 23, 42, 0.6)",
                color: isSelected ? "#38bdf8" : "#94a3b8",
                boxShadow: isSelected ? "0 0 15px rgba(56, 189, 248, 0.3)" : "none"
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. REGULATORY FOUNDATION CARD */}
      <div style={{
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: "14px",
        padding: "1.75rem",
        border: "1.5px solid rgba(56, 189, 248, 0.3)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
        marginBottom: "2rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Statutory Basis
            </div>
            <h2 style={{ margin: "0.2rem 0", fontSize: "1.4rem", fontWeight: 900, color: "#ffffff" }}>
              REGULATORY FOUNDATION
            </h2>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <a
              href="https://wbconsumers.gov.in/writereaddata/ACT%20&%20RULES/Act%20&%20Rules/9%20The%20Legal%20Metrology%20(Package%20Commodities)%20Rules,%202011.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "0.6rem 1.25rem",
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                color: "#ffffff",
                borderRadius: "8px",
                fontSize: "0.84rem",
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 10px rgba(5, 150, 105, 0.35)"
              }}
            >
              <span>VIEW METROLOGY RULES</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "1rem 1.25rem", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Primary Legislation</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff", marginTop: "3px" }}>Legal Metrology Act, 2009</div>
            <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "3px" }}>Act No. 1 of 2010 • Enacted by Parliament of India</div>
          </div>

          <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "1rem 1.25rem", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Packaged Commodity Requirements</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#38bdf8", marginTop: "3px" }}>Legal Metrology (Packaged Commodities) Rules, 2011</div>
            <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "3px" }}>G.S.R. 202(E) • Statutory Declaration Mandate</div>
          </div>

          <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "1rem 1.25rem", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Supporting Material</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ffffff", marginTop: "3px" }}>Applicable Amendments & Gazette Publications</div>
            <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "3px" }}>Official Notifications (2021, 2022, 2023, 2024)</div>
          </div>

          <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "1rem 1.25rem", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Source Authority</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#34d399", marginTop: "3px" }}>Government of India</div>
            <div style={{ fontSize: "0.76rem", color: "#cbd5e1", marginTop: "3px" }}>Department of Consumer Affairs • Legal Metrology Division</div>
          </div>
        </div>
      </div>
      {/* 2. PERSPECTIVE SECTIONS */}

      {/* PERSPECTIVE A: CONSUMER VIEW */}
      {activePerspective === "consumer" && (
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase" }}>
                Consumer Protection & Rights
              </div>
              <h2 style={{ margin: "0.2rem 0", fontSize: "1.4rem", fontWeight: 900, color: "#ffffff" }}>
                KNOW WHAT TO CHECK ON PACKAGED PRODUCTS
              </h2>
            </div>

            <button
              onClick={() => onNavigate("/user/complaints")}
              style={{
                padding: "0.55rem 1.1rem",
                background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.35)"
              }}
            >
              Found Something Suspicious? File Grievance ✍️
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.2rem" }}>
            {consumerChecklistCards.map((c, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1.2rem" }}>{c.icon}</span>
                      <strong style={{ fontSize: "0.95rem", color: "#ffffff" }}>{c.title}</strong>
                    </div>
                    <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "0.15rem 0.45rem", borderRadius: "4px", fontWeight: 700 }}>
                      {c.rule}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#cbd5e1", marginBottom: "0.75rem", lineHeight: 1.4 }}>
                    <strong style={{ color: "#94a3b8" }}>What to look for:</strong> {c.lookFor}
                  </div>
                </div>

                <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase" }}>Why It Matters</div>
                  <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "2px" }}>{c.whyItMatters}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PERSPECTIVE B: OFFICER VIEW */}
      {activePerspective === "officer" && (
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#818cf8", textTransform: "uppercase" }}>
              Enforcement Protocol & Legal Verification Standard
            </div>
            <h2 style={{ margin: "0.2rem 0", fontSize: "1.4rem", fontWeight: 900, color: "#ffffff" }}>
              OFFICIAL REGULATORY AUDIT & VERIFICATION DIRECTIVES
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", padding: "1.5rem", borderRadius: "12px", border: "1.5px solid rgba(99, 102, 241, 0.3)" }}>
              <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.05rem", fontWeight: 800, color: "#818cf8", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>🛡️</span>
                <span>Statutory Authority & Non-Delegable Role</span>
              </h3>
              <p style={{ fontSize: "0.84rem", color: "#cbd5e1", lineHeight: 1.55, margin: "0 0 0.85rem 0" }}>
                Under Section 15 and Section 18 of the Legal Metrology Act, 2009, power of inspection, seizure, notice issuance, and compounding resides exclusively with appointed <strong>Legal Metrology Officers and Controllers</strong>.
              </p>
              <div style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "0.78rem", color: "#fed7aa" }}>
                ⚖️ <strong>Decision Support Mandate:</strong> The AI OCR engine extracts textual evidence and highlights potential discrepancies. The evaluating officer must independently review the physical packaging or evidence image before issuing statutory Show Cause Notices.
              </div>
            </div>

            <div style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", padding: "1.5rem", borderRadius: "12px", border: "1.5px solid rgba(56, 189, 248, 0.3)" }}>
              <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.05rem", fontWeight: 800, color: "#38bdf8", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>📑</span>
                <span>Statutory Evidence Organization Standard</span>
              </h3>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                <li><strong>Principal Display Panel:</strong> Inspect dimensions and area proportion under Rule 7.</li>
                <li><strong>Font Size & Height:</strong> Minimum height criteria based on net quantity volume/weight under Rule 9.</li>
                <li><strong>Dual Pricing Prohibitions:</strong> Ensure no price alteration sticker or higher MRP printing.</li>
                <li><strong>Unit Sale Price:</strong> Mandated for packages above 1kg/1L under 2022/2023 amendment notifications.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* PERSPECTIVE C: MANUFACTURER VIEW */}
      {activePerspective === "manufacturer" && (
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#34d399", textTransform: "uppercase" }}>
                Pre-Market Packaging Compliance
              </div>
              <h2 style={{ margin: "0.2rem 0", fontSize: "1.4rem", fontWeight: 900, color: "#ffffff" }}>
                MANUFACTURER COMPLIANCE GUIDANCE & CHECKLIST
              </h2>
            </div>

            <a
              href="https://consumeraffairs.nic.in/taxonomy/term/2645"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "0.55rem 1.1rem",
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                color: "#ffffff",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <span>OPEN OFFICIAL REGULATIONS</span>
              <span>↗</span>
            </a>
          </div>

          <div style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", borderRadius: "14px", padding: "1.5rem", border: "1.5px solid rgba(52, 211, 153, 0.35)", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 800, color: "#ffffff" }}>
              Pre-Market Cylinder & Artwork Verification Checklist:
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.85rem" }}>
              {[
                "✓ Verify all 11 mandatory statutory declarations are present on artwork.",
                "✓ Verify net quantity is slated in standard SI metric units (g, kg, ml, L).",
                "✓ Verify MRP declaration format includes 'inclusive of all taxes'.",
                "✓ Verify Unit Sale Price (USP) is calculated and rendered adjacent to MRP.",
                "✓ Verify complete postal address with PIN code for customer care contacts.",
                "✓ Verify Month and Year of packing/manufacture formatting.",
                "✓ Verify Country of Origin declaration ('Made in India' / Origin).",
                "✓ Verify font size complies with minimum millimeter height criteria."
              ].map((item, idx) => (
                <div key={idx} style={{ backgroundColor: "rgba(7, 11, 20, 0.6)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "0.82rem", color: "#e2e8f0", fontWeight: 600 }}>
                  {item}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", backgroundColor: "rgba(52, 211, 153, 0.1)", borderRadius: "8px", border: "1px solid rgba(52, 211, 153, 0.3)", fontSize: "0.78rem", color: "#a7f3d0" }}>
              💡 <strong>Compliance Notice:</strong> Use this checklist as a compliance-support tool. Always verify against the latest applicable Government notification/rule prior to mass cylinder printing.
            </div>
          </div>
        </div>
      )}
      {/* 3. INTERNAL TAXONOMY BREAKDOWN (LM-01 to LM-11) */}
      <div style={{
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: "14px",
        padding: "1.75rem",
        border: "1.5px solid rgba(56, 189, 248, 0.25)",
        marginBottom: "2rem"
      }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase" }}>
            Application Data Schema
          </div>
          <h2 style={{ margin: "0.2rem 0", fontSize: "1.35rem", fontWeight: 900, color: "#ffffff" }}>
            HOW OUR SYSTEM ORGANIZES THE LEGAL REQUIREMENTS
          </h2>
          <div style={{
            marginTop: "0.5rem",
            padding: "0.75rem 1rem",
            backgroundColor: "rgba(56, 189, 248, 0.1)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            borderRadius: "8px",
            fontSize: "0.82rem",
            color: "#bae6fd",
            lineHeight: 1.45
          }}>
            ℹ️ <strong>System Taxonomy Notice:</strong> LM-01 to LM-11 are internal identifiers created by this application to organize machine-checkable compliance categories. They are <strong>NOT</strong> official Government rule numbers.
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.84rem" }}>
            <thead style={{ backgroundColor: "rgba(7, 11, 20, 0.8)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "#94a3b8" }}>
              <tr>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Internal ID</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Category Name</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Statutory Source Provision</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Neural OCR Detection Pattern</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, textAlign: "right" }}>Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(TAXONOMY_LEGAL_MAPPING).map(([id, info]) => (
                <tr key={id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 800, color: "#38bdf8", whiteSpace: "nowrap" }}>
                    {id}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#ffffff" }}>
                    {info.name}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#cbd5e1" }}>
                    {info.statutory_rule}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontSize: "0.78rem" }}>
                    {info.ocr_logic}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      onClick={() => setModalCategory(id)}
                      style={{
                        padding: "0.35rem 0.75rem",
                        backgroundColor: "rgba(56, 189, 248, 0.15)",
                        color: "#38bdf8",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        borderRadius: "6px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      View Legal Basis →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. OFFICIAL GOVERNMENT SOURCES LIBRARY */}
      <div style={{
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: "14px",
        padding: "1.75rem",
        border: "1.5px solid rgba(255, 255, 255, 0.1)",
        marginBottom: "2rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase" }}>
              Authoritative Reference Repository
            </div>
            <h2 style={{ margin: "0.2rem 0", fontSize: "1.35rem", fontWeight: 900, color: "#ffffff" }}>
              OFFICIAL GOVERNMENT SOURCES
            </h2>
          </div>

          <input
            type="text"
            placeholder="Search official sources & acts..."
            value={sourceSearch}
            onChange={(e) => setSourceSearch(e.target.value)}
            style={{
              width: "280px",
              padding: "0.6rem 0.9rem",
              backgroundColor: "rgba(7, 11, 20, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "0.82rem"
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.2rem" }}>
          {filteredSources.map((src) => (
            <div
              key={src.id}
              style={{
                backgroundColor: "rgba(7, 11, 20, 0.6)",
                borderRadius: "12px",
                padding: "1.25rem",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.72rem", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>
                    {src.tag}
                  </span>
                  <span style={{ fontSize: "0.74rem", color: "#64748b" }}>SOURCE {src.id}</span>
                </div>

                <h3 style={{ margin: "0.2rem 0", fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                  {src.title}
                </h3>
                <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "#38bdf8", marginBottom: "0.5rem" }}>
                  {src.organization}
                </div>
                <p style={{ margin: "0 0 1rem 0", fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.45 }}>
                  {src.description}
                </p>
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  borderRadius: "8px",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxSizing: "border-box"
                }}
              >
                <span>{src.buttonText}</span>
                <span>↗</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 5. REGULATORY UPDATE NOTICE */}
      <div style={{
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        borderRadius: "12px",
        padding: "1.25rem 1.5rem",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#fb923c", textTransform: "uppercase" }}>
            REGULATORY UPDATE NOTICE
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.84rem", color: "#cbd5e1", lineHeight: 1.45 }}>
            Legal requirements may be amended through Government notifications. The application should be used with the latest applicable statutory rules and notifications.
          </p>
        </div>

        <a
          href="https://consumeraffairs.nic.in/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "0.6rem 1.1rem",
            backgroundColor: "rgba(251, 146, 60, 0.15)",
            color: "#fb923c",
            border: "1px solid rgba(251, 146, 60, 0.35)",
            borderRadius: "8px",
            fontSize: "0.8rem",
            fontWeight: 800,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          <span>CHECK OFFICIAL DCA SOURCES</span>
          <span>↗</span>
        </a>
      </div>

      {/* 6. REFERENCES FOOTER & FINAL DISCLAIMER */}
      <div style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        paddingTop: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            REGULATORY REFERENCES
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.8rem" }}>
            <a href="https://www.indiacode.nic.in/handle/123456789/14044" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", textDecoration: "none" }}>
              • Legal Metrology Act, 2009 — India Code ↗
            </a>
            <a href="https://consumeraffairs.nic.in/taxonomy/term/2645" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", textDecoration: "none" }}>
              • Legal Metrology (Packaged Commodities) Rules, 2011 ↗
            </a>
            <a href="https://consumeraffairs.nic.in/" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", textDecoration: "none" }}>
              • Department of Consumer Affairs — Legal Metrology ↗
            </a>
            <a href="https://consumeraffairs.nic.in/legalmetrologyactsandrules/legal-metrology-packaged-commodities-amendment-rules-2023-2" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", textDecoration: "none" }}>
              • Applicable Packaged Commodities Amendment Notifications ↗
            </a>
          </div>
        </div>

        <div style={{
          backgroundColor: "rgba(7, 11, 20, 0.8)",
          padding: "1rem 1.25rem",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: "0.76rem",
          color: "#94a3b8",
          lineHeight: 1.5
        }}>
          <strong>Disclaimer:</strong> This platform is an AI-assisted compliance screening and enforcement-support system. OCR and automated rule evaluation may contain errors and should not be treated as a final legal determination. Applicable laws, rules, amendments and Government notifications should be verified from official sources. Final statutory interpretation and enforcement action remain with the competent Legal Metrology authority.
        </div>
      </div>

      {/* Interactive Modal */}
      {modalCategory && (
        <LegalBasisModal
          isOpen={true}
          onClose={() => setModalCategory(null)}
          ruleId={modalCategory}
          status="COMPLIANT"
          confidence="98%"
        />
      )}
    </div>
  );
};
