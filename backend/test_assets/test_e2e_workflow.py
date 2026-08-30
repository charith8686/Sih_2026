import sys
import os
import json
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import init_and_seed_db

def run_workflow_tests():
    print("=" * 70)
    print("STARTING E2E INTEGRATED THREE-STAKEHOLDER WORKFLOW TEST SUITE")
    print("=" * 70)

    # Re-initialize test database
    init_and_seed_db()
    client = TestClient(app)

    # 1. Test Login for All 3 Stakeholders
    print("\n[Step 1] Authenticating Stakeholders...")
    # Consumer
    res_user = client.post("/api/auth/login", json={"email": "user@demo.com", "password": "User@123", "role": "user"})
    assert res_user.status_code == 200, f"User login failed: {res_user.text}"
    user_token = res_user.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    print("  [OK] Consumer (Rahul Sharma) authenticated successfully.")

    # Officer
    res_officer = client.post("/api/auth/login", json={"email": "officer@lm.gov.in", "password": "Officer@123", "role": "officer"})
    assert res_officer.status_code == 200, f"Officer login failed: {res_officer.text}"
    officer_token = res_officer.json()["access_token"]
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    print("  [OK] Legal Metrology Officer (Vikram Sethi) authenticated successfully.")

    # Manufacturer
    res_mfg = client.post("/api/auth/login", json={"email": "manufacturer@abcfoods.com", "password": "Manufacturer@123", "role": "manufacturer"})
    assert res_mfg.status_code == 200, f"Manufacturer login failed: {res_mfg.text}"
    mfg_token = res_mfg.json()["access_token"]
    mfg_headers = {"Authorization": f"Bearer {mfg_token}"}
    print("  [OK] Manufacturer (ABC Foods Pvt Ltd) authenticated successfully.")

    # 2. Phase 1: Consumer Files Grievance
    print("\n[Phase 1] Consumer Files Complaint with OCR Evidence Attachment...")
    cmp_payload = {
        "product_name": "Butter Delite Cookies",
        "brand": "Butter Delite",
        "manufacturer_name": "ABC Foods Pvt Ltd",
        "issue_type": "Missing Mandatory Declarations",
        "description": "Packaging front panel lacks mandatory Unit Sale Price declaration under Rule 6(1)(e).",
        "evidence_image_url": "/outputs/sample_package_synthetic.jpg",
        "rule_id": "LM-06"
    }
    res_cmp = client.post("/api/user/complaints", json=cmp_payload, headers=user_headers)
    assert res_cmp.status_code == 200, f"Complaint creation failed: {res_cmp.text}"
    cmp_data = res_cmp.json()
    new_cmp_code = cmp_data["complaint_code"]
    new_cmp_id = cmp_data["complaint_id"]
    print(f"  [OK] Complaint filed: {new_cmp_code} (Status: {cmp_data['status']})")

    # Verify Officer received Notification
    res_off_notif = client.get("/api/notifications", headers=officer_headers)
    assert res_off_notif.status_code == 200
    notifs = res_off_notif.json()["notifications"]
    cmp_notif = next((n for n in notifs if n["entity_id"] == new_cmp_code), None)
    assert cmp_notif is not None, f"Officer did not receive notification for {new_cmp_code}"
    print(f"  [OK] Officer received real-time notification: '{cmp_notif['title']}' - {cmp_notif['message']}")

    # 3. Phase 2: Officer Verifies Complaint & Creates Statutory Violation
    print("\n[Phase 2] Officer Reviews Complaint and Issues Violation Notice...")
    verify_payload = {
        "rule_id": "LM-06",
        "rule_name": "Retail Sale Price (MRP & USP)",
        "severity": "High",
        "reason": "Statutory verification confirmed: Unit Sale Price omitted on principal display panel.",
        "officer_public_finding": "Violation of Rule 6(1)(e) Legal Metrology (Packaged Commodities) Rules 2011.",
        "officer_notes": "Issuing statutory notice to ABC Foods Pvt Ltd requiring immediate corrective packaging."
    }
    res_verify = client.post(f"/api/officer/complaints/{new_cmp_id}/verify", json=verify_payload, headers=officer_headers)
    assert res_verify.status_code == 200, f"Officer verification failed: {res_verify.text}"
    v_data = res_verify.json()
    new_vio_code = v_data["violation_code"]
    print(f"  [OK] Officer verified grievance. Violation created: {new_vio_code}")

    # Verify Manufacturer received Notification
    res_mfg_notif = client.get("/api/notifications", headers=mfg_headers)
    assert res_mfg_notif.status_code == 200
    mfg_notifs = res_mfg_notif.json()["notifications"]
    vio_notif = next((n for n in mfg_notifs if n["entity_id"] == new_vio_code), None)
    assert vio_notif is not None, f"Manufacturer did not receive violation notice for {new_vio_code}"
    print(f"  [OK] Manufacturer received targeted notification: '{vio_notif['title']}' - {vio_notif['message']}")

    # 4. Phase 3: Manufacturer Reviews Violation & Submits Corrective Action
    print("\n[Phase 3] Manufacturer Submits Remedy Artwork & Corrective Action...")
    ca_payload = {
        "violation_code": new_vio_code,
        "what_was_changed": "Replaced print cylinder to include USP Rs. 0.50/g in high-contrast 3.5mm font.",
        "proposed_resolution": "Revised all packaging runs from batch B-2026-10 onwards.",
        "explanation": "We have recalibrated our packaging artwork and updated our prepress cylinders to include compliant USP text.",
        "corrected_image_url": "/outputs/regression_annotated.jpg",
        "manufacturer_comments": "Attached proof of updated cylinder artwork and sample print verification."
    }
    res_ca = client.post("/api/manufacturer/corrective-actions", json=ca_payload, headers=mfg_headers)
    assert res_ca.status_code == 200, f"Corrective Action submission failed: {res_ca.text}"
    ca_data = res_ca.json()
    new_ca_code = ca_data["ca_code"]
    print(f"  [OK] Corrective Action submitted: {new_ca_code} (Status: {ca_data['status']})")

    # Verify Officer received Notification
    res_off_notif2 = client.get("/api/notifications", headers=officer_headers)
    assert res_off_notif2.status_code == 200
    ca_notif = next((n for n in res_off_notif2.json()["notifications"] if n["entity_id"] == new_ca_code), None)
    assert ca_notif is not None, f"Officer did not receive notification for {new_ca_code}"
    print(f"  [OK] Officer notified of remedy submission: '{ca_notif['title']}' - {ca_notif['message']}")

    # 5. Phase 4: Officer Unified Case View & Side-by-Side Review APPROVE Decision
    print("\n[Phase 4] Officer Reviews Evidence Side-by-Side and APPROVES Corrective Action...")
    res_ca_list = client.get("/api/officer/corrective-actions", headers=officer_headers)
    assert res_ca_list.status_code == 200
    ca_entry = next((c for c in res_ca_list.json() if c["ca_code"] == new_ca_code), None)
    assert ca_entry is not None

    decision_payload = {
        "decision": "APPROVE",
        "officer_notes": "Verified revised packaging artwork cylinder proof. Unit Sale Price is compliant under PCR 2011."
    }
    res_dec = client.post(f"/api/officer/corrective-actions/{ca_entry['id']}/decision", json=decision_payload, headers=officer_headers)
    assert res_dec.status_code == 200, f"Officer decision failed: {res_dec.text}"
    dec_data = res_dec.json()
    assert dec_data["corrective_action_status"] == "APPROVED"
    assert dec_data["violation_status"] == "RESOLVED"
    print(f"  [OK] Decision executed: {dec_data['decision']} -> CA: APPROVED, Violation: RESOLVED")

    # Verify Final Notifications for Consumer and Manufacturer
    res_user_notif_final = client.get("/api/notifications", headers=user_headers)
    user_resolved_notif = next((n for n in res_user_notif_final.json()["notifications"] if n["type"] == "COMPLAINT_RESOLVED"), None)
    assert user_resolved_notif is not None, "Consumer did not receive resolution notification"
    print(f"  [OK] Consumer received closure notification: '{user_resolved_notif['title']}'")

    res_mfg_notif_final = client.get("/api/notifications", headers=mfg_headers)
    mfg_approved_notif = next((n for n in res_mfg_notif_final.json()["notifications"] if n["type"] == "CORRECTIVE_ACTION_APPROVED"), None)
    assert mfg_approved_notif is not None, "Manufacturer did not receive approval notification"
    print(f"  [OK] Manufacturer received approval notification: '{mfg_approved_notif['title']}'")

    # 6. Phase 5: Test DENY, REQUEST_REVISION, and ESCALATE on Demo Case 2
    print("\n[Phase 5] Testing Officer Decision Variants (DENY, REQUEST_REVISION, ESCALATE)...")
    # Fetch demo Case 2 Corrective Action (LM-CA-2026-0001)
    res_cas = client.get("/api/officer/corrective-actions", headers=officer_headers)
    demo_ca = next((c for c in res_cas.json() if c["ca_code"] == "LM-CA-2026-0001"), None)
    assert demo_ca is not None, "Demo CA LM-CA-2026-0001 not found"

    # Test REQUEST_REVISION
    rev_payload = {"decision": "REQUEST_REVISION", "officer_notes": "Please provide batch release certificate."}
    res_rev = client.post(f"/api/officer/corrective-actions/{demo_ca['id']}/decision", json=rev_payload, headers=officer_headers)
    assert res_rev.status_code == 200 and res_rev.json()["corrective_action_status"] == "REVISION_REQUIRED"
    print("  [OK] Decision 'REQUEST_REVISION' tested successfully.")

    # Test DENY
    deny_payload = {"decision": "DENY", "reason": "Packaging cylinder artwork fails minimum font height standards."}
    res_deny = client.post(f"/api/officer/corrective-actions/{demo_ca['id']}/decision", json=deny_payload, headers=officer_headers)
    assert res_deny.status_code == 200 and res_deny.json()["corrective_action_status"] == "DENIED"
    print("  [OK] Decision 'DENY' tested successfully.")

    # Test ESCALATE
    esc_payload = {"decision": "ESCALATE", "reason": "Repeated non-compliance warranting statutory compounding penalty."}
    res_esc = client.post(f"/api/officer/corrective-actions/{demo_ca['id']}/decision", json=esc_payload, headers=officer_headers)
    assert res_esc.status_code == 200 and res_esc.json()["violation_status"] == "ESCALATED"
    print("  [OK] Decision 'ESCALATE' tested successfully.")

    # 7. Phase 6: Verify Immutable Audit Trail
    print("\n[Phase 6] Verifying Immutable Audit Trail...")
    res_audit = client.get(f"/api/audit-logs/violation/{new_vio_code}", headers=officer_headers)
    assert res_audit.status_code == 200
    logs = res_audit.json()
    assert len(logs) >= 1
    print(f"  [OK] Audit trail verified for {new_vio_code}: {len(logs)} immutable log records recorded.")

    # 8. Phase 7: Strict Security & Role Isolation Checks
    print("\n[Phase 7] Verifying Security Isolation & Role Enforcement...")
    # Consumer cannot access Officer endpoints
    res_unauth = client.get("/api/officer/dashboard", headers=user_headers)
    assert res_unauth.status_code == 403, f"Expected 403 for Consumer on Officer route, got {res_unauth.status_code}"
    print("  [OK] Consumer forbidden from Officer endpoints (403 Forbidden).")

    # Manufacturer cannot make enforcement decisions
    res_mfg_dec = client.post(f"/api/officer/corrective-actions/{demo_ca['id']}/decision", json={"decision": "APPROVE"}, headers=mfg_headers)
    assert res_mfg_dec.status_code == 403, f"Expected 403 for Manufacturer on Officer decision route, got {res_mfg_dec.status_code}"
    print("  [OK] Manufacturer forbidden from Officer decision endpoints (403 Forbidden).")

    print("\n" + "=" * 70)
    print("ALL E2E WORKFLOW TESTS PASSED SUCCESSFULLY! (100% SUCCESS)")
    print("=" * 70)

if __name__ == "__main__":
    run_workflow_tests()
