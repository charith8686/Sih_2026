import re
from typing import List, Dict, Any, Optional

def extract_declarations_from_ocr(detections: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extracts structured statutory declarations from raw EasyOCR detections.
    Uses regex, multi-line proximity grouping, and pattern normalizers.
    """
    extracted: Dict[str, Any] = {}

    if not detections:
        return extracted

    all_texts = [d["text"] for d in detections]
    full_text = " ".join(all_texts)
    full_text_lower = full_text.lower()

    def find_all(patterns: List[str]) -> List[Dict[str, Any]]:
        matched = []
        for det in detections:
            text_low = det["text"].lower()
            for pat in patterns:
                if re.search(pat, text_low):
                    matched.append(det)
                    break
        return matched

    # 1. LM-01: Manufacturer / Packer Name & Address
    mfg_dets = find_all([r"manufactur|packed by|marketed by|mfg by|pkd by|producer"])
    if mfg_dets:
        primary_det = mfg_dets[0]
        # Look for address lines near the manufacturer keyword or containing pincode
        address_parts = [primary_det["text"]]
        pincode_match = re.search(r"\b\d{6}\b", full_text)
        
        # Spatial / sequential proximity: combine following detection if it looks like an address
        p_idx = detections.index(primary_det)
        if p_idx + 1 < len(detections):
            next_det = detections[p_idx + 1]
            if any(term in next_det["text"].lower() for term in ["plot", "sector", "road", "street", "industrial", "area", "dist", "lane", "delhi", "haryana", "mumbai", "uttarakhand", "pune"]):
                address_parts.append(next_det["text"])

        extracted["LM-01"] = {
            "value": ", ".join(address_parts),
            "primary_detection": primary_det,
            "has_pincode": bool(pincode_match),
            "pincode": pincode_match.group(0) if pincode_match else None,
            "ocr_text": primary_det["text"],
            "ocr_confidence": primary_det["confidence"],
            "bounding_box": primary_det["bbox"]
        }

    # 2. LM-02: Common / Generic Name
    gen_dets = find_all([r"generic name|common name|cookies|rice|atta|wheat|paneer|biscuit|flour|oil|snack"])
    if gen_dets:
        best_gen = max(gen_dets, key=lambda d: d["confidence"])
        val_clean = re.sub(r"^(generic name|common name)\s*[:\-]\s*", "", best_gen["text"], flags=re.IGNORECASE).strip()
        extracted["LM-02"] = {
            "value": val_clean if val_clean else best_gen["text"],
            "primary_detection": best_gen,
            "ocr_text": best_gen["text"],
            "ocr_confidence": best_gen["confidence"],
            "bounding_box": best_gen["bbox"]
        }

    # 3. LM-03: Net Quantity
    qty_dets = find_all([r"net quantity|net wt|net weight|net qty|\b\d+\s*(g|kg|ml|l|gm|grams|pcs)\b"])
    if qty_dets:
        best_qty = max(qty_dets, key=lambda d: d["confidence"])
        val_match = re.search(r"(\d+(?:\.\d+)?\s*(?:g|kg|ml|l|gm|grams|pcs|count))", best_qty["text"], re.IGNORECASE)
        val = val_match.group(1) if val_match else best_qty["text"]
        has_non_standard = bool(re.search(r"\b(gms|kgs|mls)\b", best_qty["text"], re.IGNORECASE))

        # Parse magnitude & unit
        unit_match = re.search(r"(\d+(?:\.\d+)?)\s*([a-zA-Z]+)", val)
        magnitude = float(unit_match.group(1)) if unit_match else None
        unit = unit_match.group(2).lower() if unit_match else None

        extracted["LM-03"] = {
            "value": val,
            "magnitude": magnitude,
            "unit": unit,
            "has_non_standard_unit": has_non_standard,
            "primary_detection": best_qty,
            "ocr_text": best_qty["text"],
            "ocr_confidence": best_qty["confidence"],
            "bounding_box": best_qty["bbox"]
        }

    # 4. LM-04: Month & Year of Manufacture / Packing / Import
    mfg_date_dets = find_all([r"mfg|mfd|pkd|packed|pkg|manufacture|date of mfg|month & year|\b\d{2}/\d{4}\b|\b\d{2}/\d{2}\b"])
    if mfg_date_dets:
        best_date = max(mfg_date_dets, key=lambda d: d["confidence"])
        extracted["LM-04"] = {
            "value": best_date["text"],
            "primary_detection": best_date,
            "ocr_text": best_date["text"],
            "ocr_confidence": best_date["confidence"],
            "bounding_box": best_date["bbox"]
        }

    # 5. LM-05: Expiry / Use-by / Best-before
    exp_dets = find_all([r"best before|expiry|use by|exp|exp date|months from"])
    if exp_dets:
        best_exp = max(exp_dets, key=lambda d: d["confidence"])
        extracted["LM-05"] = {
            "value": best_exp["text"],
            "primary_detection": best_exp,
            "ocr_text": best_exp["text"],
            "ocr_confidence": best_exp["confidence"],
            "bounding_box": best_exp["bbox"]
        }

    # 6. LM-06: Maximum Retail Price (MRP)
    mrp_dets = find_all([r"mrp|maximum retail price|incl.*tax|inclusive of all taxes|\b[₹\$\<\>]\s*\d+"])
    if mrp_dets:
        best_mrp = max(mrp_dets, key=lambda d: d["confidence"])
        has_tax_clause = bool(re.search(r"tax|incl", full_text_lower))
        price_num_match = re.search(r"(\d+(?:\.\d{2})?)", best_mrp["text"])
        price_val = float(price_num_match.group(1)) if price_num_match else None

        extracted["LM-06"] = {
            "value": best_mrp["text"],
            "numeric_price": price_val,
            "has_tax_clause": has_tax_clause,
            "primary_detection": best_mrp,
            "ocr_text": best_mrp["text"],
            "ocr_confidence": best_mrp["confidence"],
            "bounding_box": best_mrp["bbox"]
        }

    # 7. LM-07: Unit Sale Price (USP)
    usp_dets = find_all([r"unit sale price|usp|per g|per kg|per ml|per l|/ g|/ kg|/ ml|/ l"])
    if usp_dets:
        best_usp = max(usp_dets, key=lambda d: d["confidence"])
        extracted["LM-07"] = {
            "value": best_usp["text"],
            "primary_detection": best_usp,
            "ocr_text": best_usp["text"],
            "ocr_confidence": best_usp["confidence"],
            "bounding_box": best_usp["bbox"]
        }

    # 8. LM-08: Consumer Care Details
    care_dets = find_all([r"consumer care|customer care|helpline|toll free|care@|help@|customercare|\b1800[- ]?\d+"])
    if care_dets:
        best_care = max(care_dets, key=lambda d: d["confidence"])
        phone_match = re.search(r"\b(?:1800[- ]?\d{3,4}[- ]?\d{3,4}|\d{10}|\d{4}[- ]?\d{3}[- ]?\d{4})\b", full_text)
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", full_text)

        extracted["LM-08"] = {
            "value": best_care["text"],
            "phone": phone_match.group(0) if phone_match else None,
            "email": email_match.group(0) if email_match else None,
            "primary_detection": best_care,
            "ocr_text": best_care["text"],
            "ocr_confidence": best_care["confidence"],
            "bounding_box": best_care["bbox"]
        }

    # 9. LM-09: Country of Origin (Physical Package)
    origin_dets = find_all([r"country of origin|made in|product of|origin\s*:\s*india|india\b"])
    if origin_dets:
        best_origin = max(origin_dets, key=lambda d: d["confidence"])
        extracted["LM-09"] = {
            "value": best_origin["text"],
            "primary_detection": best_origin,
            "ocr_text": best_origin["text"],
            "ocr_confidence": best_origin["confidence"],
            "bounding_box": best_origin["bbox"]
        }

    # 10. LM-10: Importer Name & Address
    importer_dets = find_all([r"imported by|importer|imported and marketed by"])
    if importer_dets:
        best_imp = max(importer_dets, key=lambda d: d["confidence"])
        extracted["LM-10"] = {
            "value": best_imp["text"],
            "primary_detection": best_imp,
            "ocr_text": best_imp["text"],
            "ocr_confidence": best_imp["confidence"],
            "bounding_box": best_imp["bbox"]
        }

    # 11. LM-11: E-commerce Digital Mandatory Declaration
    ecom_dets = find_all([r"country of origin|origin|made in|pdp|seller|manufacturer details"])
    if ecom_dets:
        best_ecom = max(ecom_dets, key=lambda d: d["confidence"])
        extracted["LM-11"] = {
            "value": best_ecom["text"],
            "primary_detection": best_ecom,
            "ocr_text": best_ecom["text"],
            "ocr_confidence": best_ecom["confidence"],
            "bounding_box": best_ecom["bbox"]
        }

    # Supplementary: Batch / Lot / Code Number
    batch_dets = find_all([r"batch|lot|b\.no|bno|lot no|code no"])
    if batch_dets:
        best_batch = max(batch_dets, key=lambda d: d["confidence"])
        extracted["LM-SUPP-BATCH"] = {
            "value": best_batch["text"],
            "primary_detection": best_batch,
            "ocr_text": best_batch["text"],
            "ocr_confidence": best_batch["confidence"],
            "bounding_box": best_batch["bbox"]
        }

    return extracted
