import re
from typing import List, Dict, Any

# 11 Core Statutory Categories
RULES_METADATA = {
    "LM-01": {
        "name": "Manufacturer / Packer / Importer Name & Address",
        "description": "Name and complete address of the manufacturer, packer, or importer including state/pin code.",
        "statutory_ref": "Rule 6(1)(a), PCR 2011",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-02": {
        "name": "Common / Generic Name of Commodity",
        "description": "Generic name or common description of the packaged product.",
        "statutory_ref": "Rule 6(1)(b), PCR 2011",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-03": {
        "name": "Net Quantity",
        "description": "Net quantity in standard metric units (g, kg, ml, l, or count) with compliant unit symbol.",
        "statutory_ref": "Rule 6(1)(c) & Rule 11, PCR 2011",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-04": {
        "name": "Manufacture / Packing / Import Date",
        "description": "Month and Year of manufacture, packing, or import (e.g. MM/YYYY or Month YYYY).",
        "statutory_ref": "Rule 6(1)(d), PCR 2011",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-05": {
        "name": "Expiry / Use-by / Best-before Date",
        "description": "Best before duration or expiry date for perishable / consumable commodities.",
        "statutory_ref": "Rule 6(1)(d) Proviso & FSSAI / PCR Alignment",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-06": {
        "name": "Maximum Retail Price (MRP)",
        "description": "MRP in format '₹ XX.XX (inclusive of all taxes)' or 'MRP Rs. XX (incl. of all taxes)'.",
        "statutory_ref": "Rule 6(1)(e), PCR 2011",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-07": {
        "name": "Unit Sale Price (USP)",
        "description": "Unit sale price per g/kg/ml/l mandatory where package contains more than 100g/ml.",
        "statutory_ref": "Rule 6(1)(e) Amendment 2021",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-08": {
        "name": "Consumer Care / Grievance Details",
        "description": "Name, address, telephone number, and email address of grievance officer / consumer care cell.",
        "statutory_ref": "Rule 6(1)(n), PCR 2011",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-09": {
        "name": "Country of Origin (Physical Package)",
        "description": "Country of origin declaration mandatory on physical packaging.",
        "statutory_ref": "Rule 6(1)(f), PCR 2011",
        "applicable_modes": ["physical_package"]
    },
    "LM-10": {
        "name": "Importer Name & Address",
        "description": "Mandatory importer details for imported packaged commodities.",
        "statutory_ref": "Rule 6(1)(a) Proviso for Imported Goods",
        "applicable_modes": ["physical_package", "ecommerce_listing"]
    },
    "LM-11": {
        "name": "E-commerce Country-of-Origin & Digital Mandatory Declaration",
        "description": "Prominent display of origin and mandatory declarations on digital e-commerce product display pages.",
        "statutory_ref": "Rule 6(10), Legal Metrology (Packaged Commodities) Amendment Rules 2017",
        "applicable_modes": ["ecommerce_listing"]
    }
}

def extract_and_evaluate_declarations(
    detections: List[Dict[str, Any]],
    inspection_type: str = "physical_package",
    evidence_image_url: str = None
) -> Dict[str, Any]:
    """
    Evaluates detections against the 11 Legal Metrology statutory categories.
    Preserves raw OCR text, confidence, bounding boxes, and statutory reasoning.
    """
    all_texts_lower = [d["text"].lower() for d in detections]
    full_text_lower = " ".join(all_texts_lower)

    results: List[Dict[str, Any]] = []

    def find_matches(patterns: List[str]) -> List[Dict[str, Any]]:
        matched = []
        for det in detections:
            text_low = det["text"].lower()
            for pat in patterns:
                if re.search(pat, text_low):
                    matched.append(det)
                    break
        return matched

    # 1. LM-01: Manufacturer Name & Address
    mfg_matches = find_matches([r"mfg|manufactur|packed by|marketed by|pkd by|producer"])
    if mfg_matches:
        best = max(mfg_matches, key=lambda d: d["confidence"])
        has_pincode = bool(re.search(r"\b\d{6}\b", full_text_lower))
        status = "COMPLIANT" if has_pincode or len(best["text"]) > 25 else "REVIEW_REQUIRED"
        reason = "Manufacturer details detected with address." if status == "COMPLIANT" else "Manufacturer detected, verify full pincode and registered address."
        results.append({
            "rule_id": "LM-01",
            "rule_name": RULES_METADATA["LM-01"]["name"],
            "statutory_ref": RULES_METADATA["LM-01"]["statutory_ref"],
            "status": status,
            "ocr_text": best["text"],
            "ocr_confidence": best["confidence"],
            "bounding_box": best["bbox"],
            "extracted_value": best["text"],
            "reason": reason,
            "evidence_image_url": evidence_image_url
        })
    else:
        results.append({
            "rule_id": "LM-01",
            "rule_name": RULES_METADATA["LM-01"]["name"],
            "statutory_ref": RULES_METADATA["LM-01"]["statutory_ref"],
            "status": "POTENTIAL_NON_COMPLIANCE",
            "ocr_text": None,
            "ocr_confidence": 0.0,
            "bounding_box": None,
            "extracted_value": None,
            "reason": "Missing mandatory manufacturer / packer name and address declaration.",
            "evidence_image_url": evidence_image_url
        })

    # 2. LM-02: Common / Generic Name
    gen_matches = find_matches([r"generic name|common name|cookies|rice|atta|wheat|paneer|biscuit|flour|oil|snack"])
    if gen_matches:
        best = max(gen_matches, key=lambda d: d["confidence"])
        results.append({
            "rule_id": "LM-02",
            "rule_name": RULES_METADATA["LM-02"]["name"],
            "statutory_ref": RULES_METADATA["LM-02"]["statutory_ref"],
            "status": "COMPLIANT",
            "ocr_text": best["text"],
            "ocr_confidence": best["confidence"],
            "bounding_box": best["bbox"],
            "extracted_value": best["text"],
            "reason": "Generic / common commodity description clearly detected on package.",
            "evidence_image_url": evidence_image_url
        })
    else:
        results.append({
            "rule_id": "LM-02",
            "rule_name": RULES_METADATA["LM-02"]["name"],
            "statutory_ref": RULES_METADATA["LM-02"]["statutory_ref"],
            "status": "REVIEW_REQUIRED",
            "ocr_text": None,
            "ocr_confidence": 0.0,
            "bounding_box": None,
            "extracted_value": None,
            "reason": "Generic commodity name not explicitly detected. Verify front panel.",
            "evidence_image_url": evidence_image_url
        })

    # 3. LM-03: Net Quantity
    qty_matches = find_matches([r"net quantity|net wt|net weight|net qty|\b\d+\s*(g|kg|ml|l|gm|grams|pieces|pcs)\b"])
    if qty_matches:
        best = max(qty_matches, key=lambda d: d["confidence"])
        val_match = re.search(r"(\d+(?:\.\d+)?\s*(?:g|kg|ml|l|gm|pieces|pcs|count))", best["text"], re.IGNORECASE)
        val = val_match.group(1) if val_match else best["text"]
        has_forbidden_unit = bool(re.search(r"\b(gms|kgs|mls)\b", best["text"], re.IGNORECASE))
        status = "POTENTIAL_NON_COMPLIANCE" if has_forbidden_unit else "COMPLIANT"
        reason = "Net quantity declared in valid metric unit." if status == "COMPLIANT" else "Unit symbol 'gms'/'kgs' is non-standard under Rule 11. Use 'g' / 'kg'."
        results.append({
            "rule_id": "LM-03",
            "rule_name": RULES_METADATA["LM-03"]["name"],
            "statutory_ref": RULES_METADATA["LM-03"]["statutory_ref"],
            "status": status,
            "ocr_text": best["text"],
            "ocr_confidence": best["confidence"],
            "bounding_box": best["bbox"],
            "extracted_value": val,
            "reason": reason,
            "evidence_image_url": evidence_image_url
        })
    else:
        results.append({
            "rule_id": "LM-03",
            "rule_name": RULES_METADATA["LM-03"]["name"],
            "statutory_ref": RULES_METADATA["LM-03"]["statutory_ref"],
            "status": "POTENTIAL_NON_COMPLIANCE",
            "ocr_text": None,
            "ocr_confidence": 0.0,
            "bounding_box": None,
            "extracted_value": None,
            "reason": "Missing mandatory Net Quantity declaration.",
            "evidence_image_url": evidence_image_url
        })

    # 4. LM-04: Manufacture / Packing / Import Date
    mfg_date_matches = find_matches([r"mfg|mfd|pkd|packed|pkg|manufacture|date of mfg|month & year"])
    if mfg_date_matches:
        best = max(mfg_date_matches, key=lambda d: d["confidence"])
        results.append({
            "rule_id": "LM-04",
            "rule_name": RULES_METADATA["LM-04"]["name"],
            "statutory_ref": RULES_METADATA["LM-04"]["statutory_ref"],
            "status": "COMPLIANT",
            "ocr_text": best["text"],
            "ocr_confidence": best["confidence"],
            "bounding_box": best["bbox"],
            "extracted_value": best["text"],
            "reason": "Month & Year of manufacture / packaging declared.",
            "evidence_image_url": evidence_image_url
        })
    else:
        results.append({
            "rule_id": "LM-04",
            "rule_name": RULES_METADATA["LM-04"]["name"],
            "statutory_ref": RULES_METADATA["LM-04"]["statutory_ref"],
            "status": "POTENTIAL_NON_COMPLIANCE",
            "ocr_text": None,
            "ocr_confidence": 0.0,
            "bounding_box": None,
            "extracted_value": None,
            "reason": "Missing mandatory Month and Year of manufacture/packaging declaration.",
            "evidence_image_url": evidence_image_url
        })

    # 5. LM-05: Expiry / Use-by / Best-before
    exp_matches = find_matches([r"best before|expiry|use by|exp|exp date|months from"])
    if exp_matches:
        best = max(exp_matches, key=lambda d: d["confidence"])
        results.append({
            "rule_id": "LM-05",
            "rule_name": RULES_METADATA["LM-05"]["name"],
            "statutory_ref": RULES_METADATA["LM-05"]["statutory_ref"],
            "status": "COMPLIANT",
            "ocr_text": best["text"],
            "ocr_confidence": best["confidence"],
            "bounding_box": best["bbox"],
            "extracted_value": best["text"],
            "reason": "Best before / Expiry period clearly declared.",
            "evidence_image_url": evidence_image_url
        })
    else:
        results.append({
            "rule_id": "LM-05",
            "rule_name": RULES_METADATA["LM-05"]["name"],
            "statutory_ref": RULES_METADATA["LM-05"]["statutory_ref"],
            "status": "REVIEW_REQUIRED",
            "ocr_text": None,
            "ocr_confidence": 0.0,
            "bounding_box": None,
            "extracted_value": None,
            "reason": "Expiry/Best before date not detected on panel. Check if commodity is non-perishable.",
            "evidence_image_url": evidence_image_url
        })

    # 6. LM-06: Maximum Retail Price (MRP)
    mrp_matches = find_matches([r"mrp|maximum retail price|incl.*tax|inclusive of all taxes|\b[₹\$\<\>]\s*\d+"])
    if mrp_matches:
        best = max(mrp_matches, key=lambda d: d["confidence"])
        has_tax_clause = bool(re.search(r"tax|incl", full_text_lower))
        status = "COMPLIANT" if has_tax_clause else "REVIEW_REQUIRED"
        reason = "MRP declared with 'inclusive of all taxes' clause." if status == "COMPLIANT" else "MRP detected, but 'inclusive of all taxes' wording requires verification under Rule 6(1)(e)."
        results.append({
            "rule_id": "LM-06",
            "rule_name": RULES_METADATA["LM-06"]["name"],
            "statutory_ref": RULES_METADATA["LM-06"]["statutory_ref"],
            "status": status,
            "ocr_text": best["text"],
            "ocr_confidence": best["confidence"],
            "bounding_box": best["bbox"],
            "extracted_value": best["text"],
            "reason": reason,
            "evidence_image_url": evidence_image_url
        })
    else:
        results.append({
            "rule_id": "LM-06",
            "rule_name": RULES_METADATA["LM-06"]["name"],
            "statutory_ref": RULES_METADATA["LM-06"]["statutory_ref"],
            "status": "POTENTIAL_NON_COMPLIANCE",
            "ocr_text": None,
            "ocr_confidence": 0.0,
            "bounding_box": None,
            "extracted_value": None,
            "reason": "Missing mandatory Maximum Retail Price (MRP) declaration.",
            "evidence_image_url": evidence_image_url
        })

    # 7. LM-07: Unit Sale Price (USP)
    usp_matches = find_matches([r"unit sale price|usp|per g|per kg|per ml|per l|/ g|/ kg|/ ml|/ l"])
    if usp_matches:
        best = max(usp_matches, key=lambda d: d["confidence"])
        results.append({
            "rule_id": "LM-07",
            "rule_name": RULES_METADATA["LM-07"]["name"],
            "statutory_ref": RULES_METADATA["LM-07"]["statutory_ref"],
            "status": "COMPLIANT",
            "ocr_text": best["text"],
            "ocr_confidence": best["confidence"],
            "bounding_box": best["bbox"],
            "extracted_value": best["text"],
            "reason": "Unit Sale Price (USP) declared in accordance with 2021 Amendment Rules.",
            "evidence_image_url": evidence_image_url
        })
    else:
        results.append({
            "rule_id": "LM-07",
            "rule_name": RULES_METADATA["LM-07"]["name"],
            "statutory_ref": RULES_METADATA["LM-07"]["statutory_ref"],
            "status": "REVIEW_REQUIRED",
            "ocr_text": None,
            "ocr_confidence": 0.0,
            "bounding_box": None,
            "extracted_value": None,
            "reason": "Unit Sale Price not explicitly detected. Mandatory if net quantity > 100g/ml.",
            "evidence_image_url": evidence_image_url
        })

    # 8. LM-08: Consumer Care Details
    care_matches = find_matches([r"consumer care|customer care|helpline|toll free|care@|help@|customercare|\b1800[- ]?\d+"])
    if care_matches:
        best = max(care_matches, key=lambda d: d["confidence"])
        has_phone = bool(re.search(r"\b1800|\b\d{10}\b|\b\d{4}[- ]?\d{3}[- ]?\d{4}\b", full_text_lower))
        has_email = bool(re.search(r"[\w\.-]+@[\w\.-]+", full_text_lower))
        status = "COMPLIANT" if has_phone or has_email else "REVIEW_REQUIRED"
        results.append({
            "rule_id": "LM-08",
            "rule_name": RULES_METADATA["LM-08"]["name"],
            "statutory_ref": RULES_METADATA["LM-08"]["statutory_ref"],
            "status": status,
            "ocr_text": best["text"],
            "ocr_confidence": best["confidence"],
            "bounding_box": best["bbox"],
            "extracted_value": best["text"],
            "reason": "Consumer grievance telephone/email helpline detected.",
            "evidence_image_url": evidence_image_url
        })
    else:
        results.append({
            "rule_id": "LM-08",
            "rule_name": RULES_METADATA["LM-08"]["name"],
            "statutory_ref": RULES_METADATA["LM-08"]["statutory_ref"],
            "status": "POTENTIAL_NON_COMPLIANCE",
            "ocr_text": None,
            "ocr_confidence": 0.0,
            "bounding_box": None,
            "extracted_value": None,
            "reason": "Missing mandatory Consumer Care contact details under Rule 6(1)(n).",
            "evidence_image_url": evidence_image_url
        })

    # 9. LM-09: Country of Origin (Physical Package)
    if inspection_type == "physical_package":
        origin_matches = find_matches([r"country of origin|made in|product of|origin: india|india\b"])
        if origin_matches:
            best = max(origin_matches, key=lambda d: d["confidence"])
            results.append({
                "rule_id": "LM-09",
                "rule_name": RULES_METADATA["LM-09"]["name"],
                "statutory_ref": RULES_METADATA["LM-09"]["statutory_ref"],
                "status": "COMPLIANT",
                "ocr_text": best["text"],
                "ocr_confidence": best["confidence"],
                "bounding_box": best["bbox"],
                "extracted_value": best["text"],
                "reason": "Country of Origin declared on physical package panel.",
                "evidence_image_url": evidence_image_url
            })
        else:
            results.append({
                "rule_id": "LM-09",
                "rule_name": RULES_METADATA["LM-09"]["name"],
                "statutory_ref": RULES_METADATA["LM-09"]["statutory_ref"],
                "status": "REVIEW_REQUIRED",
                "ocr_text": None,
                "ocr_confidence": 0.0,
                "bounding_box": None,
                "extracted_value": None,
                "reason": "Country of Origin tag not explicitly isolated. Verify address country.",
                "evidence_image_url": evidence_image_url
            })
    else:
        results.append({
            "rule_id": "LM-09",
            "rule_name": RULES_METADATA["LM-09"]["name"],
            "statutory_ref": RULES_METADATA["LM-09"]["statutory_ref"],
            "status": "NOT_APPLICABLE",
            "ocr_text": None,
            "ocr_confidence": 0.0,
            "bounding_box": None,
            "extracted_value": None,
            "reason": "Not applicable in e-commerce listing mode (governed by LM-11).",
            "evidence_image_url": evidence_image_url
        })

    # 10. LM-10: Importer Name & Address
    importer_matches = find_matches([r"imported by|importer|imported and marketed"])
    if importer_matches:
        best = max(importer_matches, key=lambda d: d["confidence"])
        results.append({
            "rule_id": "LM-10",
            "rule_name": RULES_METADATA["LM-10"]["name"],
            "statutory_ref": RULES_METADATA["LM-10"]["statutory_ref"],
            "status": "COMPLIANT",
            "ocr_text": best["text"],
            "ocr_confidence": best["confidence"],
            "bounding_box": best["bbox"],
            "extracted_value": best["text"],
            "reason": "Importer details declared for imported commodity.",
            "evidence_image_url": evidence_image_url
        })
    else:
        results.append({
            "rule_id": "LM-10",
            "rule_name": RULES_METADATA["LM-10"]["name"],
            "statutory_ref": RULES_METADATA["LM-10"]["statutory_ref"],
            "status": "NOT_APPLICABLE",
            "ocr_text": None,
            "ocr_confidence": 0.0,
            "bounding_box": None,
            "extracted_value": None,
            "reason": "Not applicable for domestically manufactured goods.",
            "evidence_image_url": evidence_image_url
        })

    # 11. LM-11: E-commerce Country-of-Origin & Digital Mandatory Declaration
    if inspection_type == "ecommerce_listing":
        ecom_origin_matches = find_matches([r"country of origin|origin|made in|manufactured in"])
        if ecom_origin_matches:
            best = max(ecom_origin_matches, key=lambda d: d["confidence"])
            results.append({
                "rule_id": "LM-11",
                "rule_name": RULES_METADATA["LM-11"]["name"],
                "statutory_ref": RULES_METADATA["LM-11"]["statutory_ref"],
                "status": "COMPLIANT",
                "ocr_text": best["text"],
                "ocr_confidence": best["confidence"],
                "bounding_box": best["bbox"],
                "extracted_value": best["text"],
                "reason": "Digital Product Display Page (PDP) explicitly discloses Country of Origin under Rule 6(10).",
                "evidence_image_url": evidence_image_url
            })
        else:
            results.append({
                "rule_id": "LM-11",
                "rule_name": RULES_METADATA["LM-11"]["name"],
                "statutory_ref": RULES_METADATA["LM-11"]["statutory_ref"],
                "status": "POTENTIAL_NON_COMPLIANCE",
                "ocr_text": None,
                "ocr_confidence": 0.0,
                "bounding_box": None,
                "extracted_value": None,
                "reason": "E-commerce listing violates Rule 6(10) by failing to display Country of Origin on PDP.",
                "evidence_image_url": evidence_image_url
            })
    else:
        results.append({
            "rule_id": "LM-11",
            "rule_name": RULES_METADATA["LM-11"]["name"],
            "statutory_ref": RULES_METADATA["LM-11"]["statutory_ref"],
            "status": "NOT_APPLICABLE",
            "ocr_text": None,
            "ocr_confidence": 0.0,
            "bounding_box": None,
            "extracted_value": None,
            "reason": "E-commerce rule evaluated in digital PDP inspection mode only.",
            "evidence_image_url": evidence_image_url
        })

    # Supplementary: Batch / Lot / Code Number
    batch_matches = find_matches([r"batch|lot|b\.no|bno|lot no|code no"])
    supplementary_batch = None
    if batch_matches:
        best = max(batch_matches, key=lambda d: d["confidence"])
        supplementary_batch = {
            "rule_id": "LM-SUPP-BATCH",
            "name": "Batch / Lot / Code Number (Supplementary)",
            "ocr_text": best["text"],
            "ocr_confidence": best["confidence"],
            "bounding_box": best["bbox"],
            "extracted_value": best["text"]
        }

    # Aggregate overall status
    non_compliant_count = sum(1 for r in results if r["status"] == "POTENTIAL_NON_COMPLIANCE")
    review_count = sum(1 for r in results if r["status"] == "REVIEW_REQUIRED")

    if non_compliant_count > 0:
        overall_status = "POTENTIAL_NON_COMPLIANCE"
    elif review_count > 0:
        overall_status = "REVIEW_REQUIRED"
    else:
        overall_status = "COMPLIANT"

    return {
        "inspection_type": inspection_type,
        "overall_status": overall_status,
        "total_categories_evaluated": len(results),
        "compliant_count": sum(1 for r in results if r["status"] == "COMPLIANT"),
        "non_compliant_count": non_compliant_count,
        "review_required_count": review_count,
        "not_applicable_count": sum(1 for r in results if r["status"] == "NOT_APPLICABLE"),
        "categories": results,
        "supplementary_batch": supplementary_batch
    }
