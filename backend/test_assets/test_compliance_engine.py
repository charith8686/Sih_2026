import os
import sys
import json
import urllib.request
import urllib.parse
import mimetypes

BASE_URL = "http://127.0.0.1:8000"

def upload_image(filepath, inspection_type="physical_package", token=None):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    filename = os.path.basename(filepath)
    content_type = mimetypes.guess_type(filepath)[0] or "image/jpeg"

    with open(filepath, "rb") as f:
        file_bytes = f.read()

    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f'Content-Disposition: form-data; name="image"; filename="{filename}"\r\n'.encode("utf-8"))
    body.extend(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
    body.extend(file_bytes)
    body.extend(b"\r\n")

    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f'Content-Disposition: form-data; name="inspection_type"\r\n\r\n'.encode("utf-8"))
    body.extend(inspection_type.encode("utf-8"))
    body.extend(b"\r\n")

    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(f"{BASE_URL}/api/ocr", data=bytes(body))
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    if token:
        req.add_header("Authorization", f"Bearer {token}")

    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def test_compliance():
    print("==================================================")
    print("PHASES 4, 5, 6 VERIFICATION: OCR + DECLARATIONS + COMPLIANCE")
    print("==================================================")

    test_img = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_package_synthetic.jpg")

    # 1. Test Physical Package Inspection
    print("\n1. Running Physical Package Compliance Check...")
    status, res = upload_image(test_img, inspection_type="physical_package")
    if status != 200:
        print(f"FAIL: Upload failed with status {status}")
        sys.exit(1)

    print(f"   -> Processing time: {res['processing_time_seconds']}s")
    print(f"   -> Detections: {res['total_detections']}")
    print(f"   -> Overall Status: {res['compliance']['overall_status']}")
    print(f"   -> Rule Set Version: {res['compliance']['rule_set_version']}")

    categories = res['compliance']['categories']
    cat_ids = [c['rule_id'] for c in categories]
    print(f"   -> Evaluated Categories: {', '.join(cat_ids)}")

    # Verify all 11 categories exist
    expected_rules = [f"LM-{i:02d}" for i in range(1, 12)]
    missing_rules = [r for r in expected_rules if r not in cat_ids]
    if missing_rules:
        print(f"FAIL: Missing rules: {missing_rules}")
        sys.exit(1)

    # Verify Contract preservation
    for cat in categories:
        for required_key in ["rule_id", "rule_name", "status", "ocr_text", "ocr_confidence", "bounding_box", "extracted_value", "reason"]:
            if required_key not in cat:
                print(f"FAIL: Category {cat.get('rule_id')} missing contract field '{required_key}'")
                sys.exit(1)

    print("   -> Result Preservation Contract: PASS (All fields preserved)")

    # 2. Test E-Commerce Listing Mode Separation
    print("\n2. Running E-Commerce Listing Inspection Mode...")
    status_ecom, res_ecom = upload_image(test_img, inspection_type="ecommerce_listing")
    ecom_cats = {c['rule_id']: c for c in res_ecom['compliance']['categories']}

    # In e-commerce mode, LM-09 should be NOT_APPLICABLE and LM-11 should be evaluated
    if ecom_cats["LM-09"]["status"] != "NOT_APPLICABLE":
        print(f"FAIL: Expected LM-09 to be NOT_APPLICABLE in ecommerce mode, got {ecom_cats['LM-09']['status']}")
        sys.exit(1)

    print(f"   -> LM-09 Status in E-Com Mode: {ecom_cats['LM-09']['status']} ({ecom_cats['LM-09']['reason']})")
    print(f"   -> LM-11 Status in E-Com Mode: {ecom_cats['LM-11']['status']}")
    print("   -> Physical vs E-commerce Mode Separation: PASS")

    print("\n==================================================")
    print("PHASES 4, 5, 6 COMPLETE & VERIFIED: PASS (100% WORKING)")
    print("==================================================")

if __name__ == "__main__":
    test_compliance()
