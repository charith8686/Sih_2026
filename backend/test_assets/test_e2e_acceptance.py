import os
import sys
import json
import time
import urllib.request
import urllib.parse
import mimetypes

BASE_URL = "http://127.0.0.1:8000"

def api_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode("utf-8"))
        except:
            return e.code, {"error": str(e)}
    except Exception as e:
        return 0, {"error": str(e)}

def upload_ocr(filepath, inspection_type="physical_package", token=None):
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

    body.extend(f"--{boundary}\r\n".encode("utf-8"))
    body.extend(f'Content-Disposition: form-data; name="multi_pass"\r\n\r\n'.encode("utf-8"))
    body.extend(b"false\r\n")

    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(f"{BASE_URL}/api/ocr", data=bytes(body))
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    if token:
        req.add_header("Authorization", f"Bearer {token}")

    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def run_acceptance_tests():
    print("================================================================================")
    print("LEGAL METROLOGY COMPLIANCE SYSTEM - COMPREHENSIVE ACCEPTANCE TEST SUITE")
    print("================================================================================")
    
    passed_tests = 0
    total_tests = 0

    def assert_test(condition, name, details=""):
        nonlocal passed_tests, total_tests
        total_tests += 1
        if condition:
            passed_tests += 1
            print(f"[ PASS ] {total_tests:02d}. {name}")
            if details:
                print(f"         -> {details}")
        else:
            print(f"[ FAIL ] {total_tests:02d}. {name}")
            if details:
                print(f"         -> ERROR: {details}")
            sys.exit(1)

    # 1. AUTHENTICATION
    print("\n--- SECTION 1: AUTHENTICATION & IDENTITY ---")
    st, res = api_request("/api/auth/login", "POST", {"email": "user@demo.com", "password": "WrongPassword"})
    assert_test(st == 401, "Invalid password rejection returns 401 Unauthorized")

    st, res_user = api_request("/api/auth/login", "POST", {"email": "user@demo.com", "password": "User@123", "role": "user"})
    assert_test(st == 200 and res_user.get("user", {}).get("role") == "user", "Consumer login (user@demo.com)", f"Token issued for {res_user.get('user', {}).get('name')}")
    user_token = res_user["access_token"]

    st, res_off = api_request("/api/auth/login", "POST", {"email": "officer@lm.gov.in", "password": "Officer@123", "role": "officer"})
    assert_test(st == 200 and res_off.get("user", {}).get("role") == "officer", "Officer login (officer@lm.gov.in)", f"Token issued for {res_off.get('user', {}).get('name')}")
    officer_token = res_off["access_token"]

    st, res_mfg = api_request("/api/auth/login", "POST", {"email": "manufacturer@abcfoods.com", "password": "Manufacturer@123", "role": "manufacturer"})
    assert_test(st == 200 and res_mfg.get("user", {}).get("role") == "manufacturer", "Manufacturer login (manufacturer@abcfoods.com)", f"Company: {res_mfg.get('user', {}).get('company_name')}")
    mfg_token = res_mfg["access_token"]

    st, me_res = api_request("/api/auth/me", "GET", token=officer_token)
    assert_test(st == 200 and me_res["email"] == "officer@lm.gov.in", "JWT Token verification (/api/auth/me)")

    # 2. RBAC & TENANT ISOLATION
    print("\n--- SECTION 2: RBAC SECURITY & TENANT DATA ISOLATION ---")
    st, _ = api_request("/api/officer/dashboard", "GET", token=user_token)
    assert_test(st == 403, "Consumer accessing Officer endpoint blocked (403 Forbidden)")

    st, _ = api_request("/api/officer/violations", "GET", token=mfg_token)
    assert_test(st == 403, "Manufacturer accessing Officer violations blocked (403 Forbidden)")

    st, _ = api_request("/api/user/complaints", "GET")
    assert_test(st == 401, "Unauthenticated request to protected endpoint blocked (401 Unauthorized)")

    st, mfg_prods = api_request("/api/manufacturer/products", "GET", token=mfg_token)
    all_abc = all(p["manufacturer_name"] == "ABC Foods Pvt Ltd" for p in mfg_prods)
    assert_test(st == 200 and all_abc and len(mfg_prods) == 2, "Strict Tenant Isolation: ABC Foods accesses only its 2 SKUs", f"Returned {len(mfg_prods)} products strictly matching ABC Foods")

    st, off_prods = api_request("/api/officer/products", "GET", token=officer_token)
    assert_test(st == 200 and len(off_prods) >= 4, "Officer Central Repository: Accesses all registered industry products", f"Total products accessible: {len(off_prods)}")

    # 3. REAL EASYOCR PIPELINE & EVIDENCE
    print("\n--- SECTION 3: REAL EASYOCR INFERENCE & EVIDENCE GENERATION ---")
    test_img = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_package_synthetic.jpg")
    st, ocr_res = upload_ocr(test_img, inspection_type="physical_package", token=user_token)
    assert_test(st == 200, "POST /api/ocr image processing succeeds")
    assert_test(ocr_res["total_detections"] >= 10, "EasyOCR real detections non-empty", f"Found {ocr_res['total_detections']} detections in {ocr_res['processing_time_seconds']}s")
    assert_test(ocr_res["average_confidence"] > 0.4, "EasyOCR average confidence is real float", f"Average Confidence: {(ocr_res['average_confidence']*100):.1f}%")
    assert_test(bool(ocr_res["annotated_image_url"]), "Annotated bounding box evidence image generated", f"Path: {ocr_res['annotated_image_url']}")

    # 4. 11 STATUTORY CATEGORIES & APPLICABILITY
    print("\n--- SECTION 4: 11 STATUTORY CATEGORIES & RESULT PRESERVATION ---")
    categories = ocr_res["compliance"]["categories"]
    cat_ids = [c["rule_id"] for c in categories]
    expected_11 = [f"LM-{i:02d}" for i in range(1, 12)]
    missing_cats = [c for c in expected_11 if c not in cat_ids]
    assert_test(len(missing_cats) == 0, "Exact 11 Statutory Categories evaluated (LM-01 through LM-11)", f"Evaluated: {', '.join(cat_ids)}")

    # Check result preservation contract
    valid_contract = all(
        all(k in c for k in ["rule_id", "rule_name", "status", "ocr_text", "ocr_confidence", "bounding_box", "extracted_value", "reason"])
        for c in categories
    )
    assert_test(valid_contract, "Result Preservation Contract strictly preserved across all rules")

    # Check 4 compliance states support
    valid_states = {"COMPLIANT", "POTENTIAL_NON_COMPLIANCE", "REVIEW_REQUIRED", "NOT_APPLICABLE"}
    states_observed = {c["status"] for c in categories}
    assert_test(states_observed.issubset(valid_states), "Status Taxonomy supports COMPLIANT / POTENTIAL_NON_COMPLIANCE / REVIEW_REQUIRED / NOT_APPLICABLE", f"Observed statuses: {states_observed}")

    # Check Physical vs E-commerce Separation
    st, ocr_ecom = upload_ocr(test_img, inspection_type="ecommerce_listing", token=officer_token)
    ecom_cats = {c["rule_id"]: c for c in ocr_ecom["compliance"]["categories"]}
    assert_test(ecom_cats["LM-09"]["status"] == "NOT_APPLICABLE" and ecom_cats["LM-11"]["status"] == "COMPLIANT", "Mode Separation: LM-09 NOT_APPLICABLE in e-commerce, LM-11 evaluated")

    # 5. WORKFLOWS: COMPLAINTS, INSPECTIONS, CORRECTIVE ACTIONS
    print("\n--- SECTION 5: STATUTORY WORKFLOWS (COMPLAINTS & CORRECTIVE ACTIONS) ---")
    st, cmp_create = api_request("/api/user/complaints", "POST", {
        "product_name": "Test Cookies Pouch",
        "brand": "Butter Delite",
        "issue_type": "Missing Mandatory Declarations",
        "description": "Faded MRP on packaging corner."
    }, token=user_token)
    assert_test(st == 200 and "LM-CMP-2026-" in cmp_create.get("complaint_code", ""), "Consumer Complaint workflow (LM-CMP-XXXX auto-generated)", f"Created: {cmp_create.get('complaint_code')}")

    st, ins_create = api_request("/api/officer/inspections", "POST", {
        "product_name": "Butter Delite Cookies 100g",
        "manufacturer_name": "ABC Foods Pvt Ltd",
        "inspection_type": "physical_package",
        "compliance_status": "POTENTIAL_NON_COMPLIANCE",
        "violations_count": 1,
        "officer_remarks": "Audit verified Rule 6(1)(e) MRP font size discrepancy."
    }, token=officer_token)
    assert_test(st == 200 and "INS-2026-" in ins_create.get("inspection_code", ""), "Officer Inspection workflow (INS-2026-XXX logged to SQLite)", f"Created: {ins_create.get('inspection_code')}")

    st, ca_create = api_request("/api/manufacturer/corrective-actions", "POST", {
        "violation_code": "VIO-2026-001",
        "explanation": "Packaging cylinders adjusted to increase MRP font height to 4.0mm."
    }, token=mfg_token)
    assert_test(st == 200, "Manufacturer Corrective Action workflow (Remedy submitted for Officer review)")

    print("\n================================================================================")
    print(f"FINAL ACCEPTANCE SUMMARY: {passed_tests}/{total_tests} TESTS PASSED (100% SUCCESS)")
    print("================================================================================")

if __name__ == "__main__":
    run_acceptance_tests()
