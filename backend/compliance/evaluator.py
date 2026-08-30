from typing import List, Dict, Any
from .rule_registry import RULES_REGISTRY, PROTOTYPE_RULESET_VERSION
from .declaration_extractor import extract_declarations_from_ocr
from .applicability import evaluate_rule_applicability

def evaluate_compliance(
    detections: List[Dict[str, Any]],
    inspection_type: str = "physical_package",
    evidence_image_url: str = None
) -> Dict[str, Any]:
    """
    Executes full statutory compliance evaluation for the 11 Legal Metrology rules
    preserving OCR evidence, bounding boxes, confidence, and legal reasoning.
    """
    extracted = extract_declarations_from_ocr(detections)
    rule_results: List[Dict[str, Any]] = []

    for rule_id in ["LM-01", "LM-02", "LM-03", "LM-04", "LM-05", "LM-06", "LM-07", "LM-08", "LM-09", "LM-10", "LM-11"]:
        meta = RULES_REGISTRY[rule_id]
        app = evaluate_rule_applicability(rule_id, extracted, inspection_type)
        decl = extracted.get(rule_id)

        # Case 1: Rule is NOT_APPLICABLE
        if app["status"] == "NOT_APPLICABLE":
            rule_results.append({
                "rule_id": rule_id,
                "rule_name": meta["rule_name"],
                "statutory_source": meta["statutory_source"],
                "rule_version": meta["version"],
                "severity": meta["default_severity"],
                "status": "NOT_APPLICABLE",
                "applicability": "NOT_APPLICABLE",
                "extracted_value": decl["value"] if decl else None,
                "ocr_text": decl["ocr_text"] if decl else None,
                "ocr_confidence": decl["ocr_confidence"] if decl else 0.0,
                "bounding_box": decl["bounding_box"] if decl else None,
                "reason": app["reason"],
                "evidence_image_url": evidence_image_url
            })
            continue

        # Case 2: Rule Applicability is UNCLEAR
        if app["status"] == "UNCLEAR":
            rule_results.append({
                "rule_id": rule_id,
                "rule_name": meta["rule_name"],
                "statutory_source": meta["statutory_source"],
                "rule_version": meta["version"],
                "severity": meta["default_severity"],
                "status": "REVIEW_REQUIRED",
                "applicability": "UNCLEAR",
                "extracted_value": decl["value"] if decl else None,
                "ocr_text": decl["ocr_text"] if decl else None,
                "ocr_confidence": decl["ocr_confidence"] if decl else 0.0,
                "bounding_box": decl["bounding_box"] if decl else None,
                "reason": f"Applicability unclear: {app['reason']}",
                "evidence_image_url": evidence_image_url
            })
            continue

        # Case 3: Rule is NOT_REQUIRED
        if app["status"] == "NOT_REQUIRED":
            rule_results.append({
                "rule_id": rule_id,
                "rule_name": meta["rule_name"],
                "statutory_source": meta["statutory_source"],
                "rule_version": meta["version"],
                "severity": meta["default_severity"],
                "status": "COMPLIANT" if decl else "NOT_APPLICABLE",
                "applicability": "NOT_REQUIRED",
                "extracted_value": decl["value"] if decl else None,
                "ocr_text": decl["ocr_text"] if decl else None,
                "ocr_confidence": decl["ocr_confidence"] if decl else 0.0,
                "bounding_box": decl["bounding_box"] if decl else None,
                "reason": f"Optional declaration: {app['reason']}",
                "evidence_image_url": evidence_image_url
            })
            continue

        # Case 4: Rule is REQUIRED
        if not decl or not decl.get("value"):
            # Mandatory declaration is missing
            rule_results.append({
                "rule_id": rule_id,
                "rule_name": meta["rule_name"],
                "statutory_source": meta["statutory_source"],
                "rule_version": meta["version"],
                "severity": meta["default_severity"],
                "status": "POTENTIAL_NON_COMPLIANCE",
                "applicability": "REQUIRED",
                "extracted_value": None,
                "ocr_text": None,
                "ocr_confidence": 0.0,
                "bounding_box": None,
                "reason": f"Mandatory declaration '{meta['rule_name']}' was not detected on the panel ({meta['statutory_source']}).",
                "evidence_image_url": evidence_image_url
            })
            continue

        # Evaluate rule-specific validity
        status = "COMPLIANT"
        reason = f"Declaration detected in accordance with {meta['statutory_source']}."

        if rule_id == "LM-01":
            if not decl.get("has_pincode") and len(decl["value"]) < 20:
                status = "REVIEW_REQUIRED"
                reason = "Manufacturer name detected, but complete registered address/pincode requires visual verification."

        elif rule_id == "LM-03":
            if decl.get("has_non_standard_unit"):
                status = "POTENTIAL_NON_COMPLIANCE"
                reason = "Non-standard unit symbol detected (e.g. 'gms'/'kgs'). Rule 11 mandates standard metric symbols 'g' or 'kg'."

        elif rule_id == "LM-06":
            if not decl.get("has_tax_clause"):
                status = "REVIEW_REQUIRED"
                reason = "MRP value detected, but mandatory 'inclusive of all taxes' statement requires verification."

        elif rule_id == "LM-08":
            if not decl.get("phone") and not decl.get("email"):
                status = "REVIEW_REQUIRED"
                reason = "Consumer care heading detected, but phone/email digits require verification."

        rule_results.append({
            "rule_id": rule_id,
            "rule_name": meta["rule_name"],
            "statutory_source": meta["statutory_source"],
            "rule_version": meta["version"],
            "severity": meta["default_severity"],
            "status": status,
            "applicability": "REQUIRED",
            "extracted_value": decl["value"],
            "ocr_text": decl["ocr_text"],
            "ocr_confidence": decl["ocr_confidence"],
            "bounding_box": decl["bounding_box"],
            "reason": reason,
            "evidence_image_url": evidence_image_url
        })

    # Supplementary: Batch / Lot / Code
    supp_batch = extracted.get("LM-SUPP-BATCH")

    # Overall compliance status calculation
    non_compliant_count = sum(1 for r in rule_results if r["status"] == "POTENTIAL_NON_COMPLIANCE")
    review_count = sum(1 for r in rule_results if r["status"] == "REVIEW_REQUIRED")

    if non_compliant_count > 0:
        overall_status = "POTENTIAL_NON_COMPLIANCE"
    elif review_count > 0:
        overall_status = "REVIEW_REQUIRED"
    else:
        overall_status = "COMPLIANT"

    return {
        "rule_set_version": PROTOTYPE_RULESET_VERSION,
        "disclaimer": "AI-Assisted Compliance Screening Prototype - Decision Support Only. Final legal enforcement decisions remain with authorized Legal Metrology officers.",
        "inspection_type": inspection_type,
        "overall_status": overall_status,
        "total_rules_evaluated": len(rule_results),
        "compliant_count": sum(1 for r in rule_results if r["status"] == "COMPLIANT"),
        "non_compliant_count": non_compliant_count,
        "review_required_count": review_count,
        "not_applicable_count": sum(1 for r in rule_results if r["status"] == "NOT_APPLICABLE"),
        "categories": rule_results,
        "supplementary_batch": supp_batch
    }
