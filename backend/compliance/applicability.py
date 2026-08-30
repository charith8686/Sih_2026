from typing import Dict, Any

def evaluate_rule_applicability(
    rule_id: str,
    extracted_declarations: Dict[str, Any],
    inspection_type: str = "physical_package"
) -> Dict[str, Any]:
    """
    Evaluates whether a specific Legal Metrology rule is:
    - REQUIRED
    - NOT_REQUIRED
    - UNCLEAR
    - NOT_APPLICABLE
    """
    # E-commerce vs Physical Package mode check
    if rule_id == "LM-11":
        if inspection_type == "ecommerce_listing":
            return {"status": "REQUIRED", "reason": "Mandatory digital disclosure on e-commerce product display pages under Rule 6(10)."}
        else:
            return {"status": "NOT_APPLICABLE", "reason": "Applicable exclusively to digital e-commerce listings."}

    if rule_id == "LM-09" and inspection_type == "ecommerce_listing":
        return {"status": "NOT_APPLICABLE", "reason": "Physical on-pack origin check superseded by LM-11 in e-commerce mode."}

    # LM-07: Unit Sale Price (USP) dedicated evaluator
    if rule_id == "LM-07":
        qty_info = extracted_declarations.get("LM-03")
        if not qty_info or qty_info.get("magnitude") is None:
            return {
                "status": "UNCLEAR",
                "reason": "Net quantity value could not be unambiguously parsed to determine USP threshold applicability under Rule 6(1)(e)."
            }

        mag = qty_info["magnitude"]
        unit = qty_info.get("unit", "")

        # Mandatory if weight > 100g, volume > 100ml, or count > 1
        if unit in ["g", "gm", "grams"] and mag > 100:
            return {"status": "REQUIRED", "reason": f"Net quantity ({mag} g) exceeds 100 g threshold, requiring Unit Sale Price declaration."}
        elif unit in ["kg", "kgs", "kilograms"]:
            return {"status": "REQUIRED", "reason": f"Net quantity ({mag} kg) exceeds 100 g threshold, requiring Unit Sale Price declaration."}
        elif unit in ["ml", "mls"] and mag > 100:
            return {"status": "REQUIRED", "reason": f"Net quantity ({mag} ml) exceeds 100 ml threshold, requiring Unit Sale Price declaration."}
        elif unit in ["l", "litre", "litres"]:
            return {"status": "REQUIRED", "reason": f"Net quantity ({mag} l) exceeds 100 ml threshold, requiring Unit Sale Price declaration."}
        elif unit in ["g", "gm", "ml"] and mag <= 100:
            return {"status": "NOT_REQUIRED", "reason": f"Net quantity ({mag} {unit}) is <= 100 {unit}; Unit Sale Price is optional under PCR 2021 Amendment."}
        else:
            return {"status": "UNCLEAR", "reason": f"Non-standard measurement unit '{unit}'. Requires review by inspector."}

    # LM-10: Importer Name & Address
    if rule_id == "LM-10":
        origin_info = extracted_declarations.get("LM-09")
        importer_info = extracted_declarations.get("LM-10")
        if importer_info:
            return {"status": "REQUIRED", "reason": "Importer declaration detected on packaging for imported commodity."}
        elif origin_info and "india" not in origin_info.get("value", "").lower():
            return {"status": "REQUIRED", "reason": "Commodity identified as imported from foreign origin; Importer details mandatory."}
        else:
            return {"status": "NOT_APPLICABLE", "reason": "Commodity manufactured domestically within India; Importer declaration not required."}

    # Core mandatory rules (LM-01, LM-02, LM-03, LM-04, LM-05, LM-06, LM-08)
    return {"status": "REQUIRED", "reason": "Mandatory statutory declaration under Legal Metrology (Packaged Commodities) Rules 2011."}
