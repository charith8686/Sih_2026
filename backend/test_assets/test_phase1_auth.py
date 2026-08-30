import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))
    except Exception as e:
        return 0, str(e)

def run_phase1_tests():
    print("==================================================")
    print("PHASE 1 VERIFICATION: AUTHENTICATION & RBAC SECURITY")
    print("==================================================")

    # 1. Test Health
    status, res = make_request("/api/health")
    if status != 200:
        print(f"FAIL: Health check returned {status}")
        sys.exit(1)
    print("1. Health Endpoint: PASS (200 OK)")

    # 2. Test Invalid Password
    status, res = make_request("/api/auth/login", "POST", {"email": "user@demo.com", "password": "WrongPassword"})
    if status != 401:
        print(f"FAIL: Expected 401 for wrong password, got {status}")
        sys.exit(1)
    print("2. Invalid Password Rejection: PASS (401 Unauthorized)")

    # 3. Test User Login
    status, res = make_request("/api/auth/login", "POST", {"email": "user@demo.com", "password": "User@123", "role": "user"})
    if status != 200 or "access_token" not in res or res["user"]["role"] != "user":
        print(f"FAIL: User login failed: {res}")
        sys.exit(1)
    user_token = res["access_token"]
    print(f"3. Consumer Login (user@demo.com): PASS -> Token received for '{res['user']['name']}'")

    # 4. Test Officer Login
    status, res = make_request("/api/auth/login", "POST", {"email": "officer@lm.gov.in", "password": "Officer@123", "role": "officer"})
    if status != 200 or res["user"]["role"] != "officer":
        print(f"FAIL: Officer login failed: {res}")
        sys.exit(1)
    officer_token = res["access_token"]
    print(f"4. Officer Login (officer@lm.gov.in): PASS -> Token received for '{res['user']['name']}'")

    # 5. Test Manufacturer Login
    status, res = make_request("/api/auth/login", "POST", {"email": "manufacturer@abcfoods.com", "password": "Manufacturer@123", "role": "manufacturer"})
    if status != 200 or res["user"]["role"] != "manufacturer":
        print(f"FAIL: Manufacturer login failed: {res}")
        sys.exit(1)
    mfg_token = res["access_token"]
    print(f"5. Manufacturer Login (manufacturer@abcfoods.com): PASS -> Token received for '{res['user']['company_name']}'")

    # 6. Test RBAC: Consumer attempting Officer endpoint
    status, res = make_request("/api/officer/dashboard", "GET", token=user_token)
    if status != 403:
        print(f"FAIL: Expected 403 Forbidden for consumer accessing officer dashboard, got {status}")
        sys.exit(1)
    print("6. RBAC Guard (Consumer -> Officer Route): PASS (403 Forbidden correctly enforced)")

    # 7. Test RBAC: Manufacturer attempting Officer endpoint
    status, res = make_request("/api/officer/inspections", "GET", token=mfg_token)
    if status != 403:
        print(f"FAIL: Expected 403 Forbidden for manufacturer accessing officer inspections, got {status}")
        sys.exit(1)
    print("7. RBAC Guard (Manufacturer -> Officer Route): PASS (403 Forbidden correctly enforced)")

    # 8. Test Data Isolation: Manufacturer Products
    status, mfg_products = make_request("/api/manufacturer/products", "GET", token=mfg_token)
    if status != 200:
        print(f"FAIL: Manufacturer products returned {status}")
        sys.exit(1)
    for p in mfg_products:
        if p["manufacturer_name"] != "ABC Foods Pvt Ltd":
            print(f"FAIL: Data Isolation breach! ABC Foods saw {p['manufacturer_name']}")
            sys.exit(1)
    print(f"8. Data Isolation: PASS -> Manufacturer only accesses ABC Foods products ({len(mfg_products)} products)")

    # 9. Test Officer Product Repository (sees all products)
    status, all_products = make_request("/api/officer/products", "GET", token=officer_token)
    if status != 200 or len(all_products) < 3:
        print(f"FAIL: Officer products returned {status}")
        sys.exit(1)
    print(f"9. Officer Product Repository: PASS -> Officer accesses all registered products ({len(all_products)} products)")

    # 10. Test Consumer Dashboard
    status, user_dash = make_request("/api/user/dashboard", "GET", token=user_token)
    if status != 200:
        print(f"FAIL: User dashboard returned {status}")
        sys.exit(1)
    print("10. Consumer Dashboard API: PASS (200 OK)")

    print("==================================================")
    print("PHASE 1 COMPLETE & VERIFIED: PASS (10/10 TESTS PASSED)")
    print("==================================================")

if __name__ == "__main__":
    run_phase1_tests()
