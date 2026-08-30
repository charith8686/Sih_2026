import os
import uuid
import time
import json
import shutil
import cv2
import datetime
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_optional,
    require_role
)
from database import (
    get_db,
    init_and_seed_db,
    User,
    Product,
    Inspection,
    Violation,
    Complaint,
    CorrectiveAction,
    Notification,
    AuditLog,
    ScanRecord
)
from ocr.engine import run_ocr, generate_annotated_image
from compliance import evaluate_compliance, RULES_REGISTRY

def create_notification(
    db: Session,
    recipient_user_id: Optional[int],
    recipient_role: Optional[str],
    notif_type: str,
    title: str,
    message: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    action_url: Optional[str] = None
):
    notif = Notification(
        recipient_user_id=recipient_user_id,
        recipient_role=recipient_role,
        type=notif_type,
        title=title,
        message=message,
        entity_type=entity_type,
        entity_id=entity_id,
        action_url=action_url,
        is_read=False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(notif)
    db.commit()
    return notif

def log_audit(
    db: Session,
    user: dict,
    action: str,
    entity_type: str,
    entity_id: str,
    details: Optional[str] = None
):
    audit = AuditLog(
        user_id=user.get("user_id") or user.get("id"),
        user_name=user.get("name", "System User"),
        user_role=user.get("role", "unknown"),
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    return audit

# Initialize database tables and demo seed data on startup
init_and_seed_db()

app = FastAPI(
    title="Legal Metrology Compliance & Inspection System",
    description="AI-Assisted Packaged Commodity Compliance with EasyOCR and Statutory Rule Engine",
    version="2.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)

app.mount("/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}

# ----------------- PYDANTIC SCHEMAS -----------------

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None

class ComplaintCreate(BaseModel):
    product_name: str
    brand: Optional[str] = None
    manufacturer_name: Optional[str] = None
    issue_type: str
    description: str
    evidence_image_url: Optional[str] = None
    ocr_scan_id: Optional[int] = None
    detected_declarations_json: Optional[str] = None
    compliance_status: Optional[str] = None
    rule_id: Optional[str] = None

class ComplaintVerifyRequest(BaseModel):
    rule_id: str
    rule_name: str
    severity: str = "Medium"
    reason: str
    officer_public_finding: Optional[str] = None
    officer_notes: Optional[str] = None

class ComplaintRejectRequest(BaseModel):
    rejection_reason: str

class CorrectiveActionCreate(BaseModel):
    violation_code: str
    what_was_changed: Optional[str] = None
    proposed_resolution: Optional[str] = None
    explanation: str
    corrected_image_url: Optional[str] = None
    supporting_docs_url: Optional[str] = None
    manufacturer_comments: Optional[str] = None

class OfficerDecisionRequest(BaseModel):
    decision: str # APPROVE, DENY, REQUEST_REVISION, ESCALATE
    officer_notes: Optional[str] = None
    reason: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    status: str
    remarks: Optional[str] = None

class InspectionCreate(BaseModel):
    product_name: str
    manufacturer_name: str
    inspection_type: str = "physical_package"
    compliance_status: str
    violations_count: int = 0
    evidence_image_url: Optional[str] = None
    officer_remarks: Optional[str] = None
    declarations_json: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    brand: Optional[str] = None
    category: Optional[str] = "Packaged Food"
    pack_size: Optional[str] = "100 g"
    mrp: Optional[float] = 0.0
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    compliance_status: Optional[str] = "COMPLIANT"

# ----------------- AUTHENTICATION ENDPOINTS -----------------

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Legal Metrology Packaged Commodity Compliance System",
        "version": "2.0.0",
        "db": "SQLite + SQLAlchemy",
        "engine": "EasyOCR + Statutory Rule Engine"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "ocr_engine": "EasyOCR (en)",
        "statutory_rules": len(RULES_REGISTRY),
        "db": "connected"
    }

@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please check your credentials."
        )

    # If role was passed, verify it matches the user record
    if req.role and req.role.lower() != user.role.lower():
        raise HTTPException(
            status_code=403,
            detail=f"User '{req.email}' is registered as '{user.role.upper()}', not '{req.role.upper()}'."
        )

    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "company_name": user.company_name,
        "designation": user.designation
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "company_name": user.company_name,
            "designation": user.designation
        }
    }

@app.get("/api/auth/me")
def get_current_user_profile(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = user.get("user_id") or user.get("id")
    user_db = db.query(User).filter(User.id == user_id).first()
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user_db.id,
        "name": user_db.name,
        "email": user_db.email,
        "role": user_db.role,
        "company_name": user_db.company_name,
        "designation": user_db.designation
    }

# ----------------- NOTIFICATION ENDPOINTS -----------------

@app.get("/api/notifications")
def get_user_notifications(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = user.get("user_id") or user.get("id")
    user_role = user.get("role")

    notifs = db.query(Notification).filter(
        (Notification.recipient_user_id == user_id) |
        (Notification.recipient_role == user_role)
    ).order_by(Notification.created_at.desc()).limit(50).all()

    unread_count = sum(1 for n in notifs if not n.is_read)

    return {
        "unread_count": unread_count,
        "notifications": [
            {
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "entity_type": n.entity_type,
                "entity_id": n.entity_id,
                "is_read": n.is_read,
                "action_url": n.action_url,
                "created_at": n.created_at.strftime("%d %b %Y, %H:%M")
            }
            for n in notifs
        ]
    }

@app.post("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"success": True, "message": "Notification marked as read"}

@app.post("/api/notifications/read-all")
def mark_all_notifications_read(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = user.get("user_id") or user.get("id")
    user_role = user.get("role")
    db.query(Notification).filter(
        (Notification.recipient_user_id == user_id) |
        (Notification.recipient_role == user_role)
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"success": True, "message": "All notifications marked as read"}

# ----------------- AUDIT LOG ENDPOINTS -----------------

@app.get("/api/audit-logs/{entity_type}/{entity_id}")
def get_audit_logs(entity_type: str, entity_id: str, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(
        AuditLog.entity_type == entity_type,
        AuditLog.entity_id == entity_id
    ).order_by(AuditLog.timestamp.asc()).all()

    return [
        {
            "id": l.id,
            "user_name": l.user_name,
            "user_role": l.user_role,
            "action": l.action,
            "details": l.details,
            "timestamp": l.timestamp.strftime("%d %b %Y, %H:%M:%S")
        }
        for l in logs
    ]

# ----------------- CORE REAL OCR & STATUTORY COMPLIANCE -----------------

@app.post("/api/ocr")
async def process_image_ocr(
    image: UploadFile = File(...),
    multi_pass: bool = Form(default=False),
    inspection_type: str = Form(default="physical_package"),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Executes real EasyOCR pipeline, evaluates the 11 Legal Metrology statutory categories,
    generates annotated bounding box image, and persists scan history in SQLite.
    """
    start_time = time.time()
    current_user = get_current_user_optional(authorization)

    if not image.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    ext = os.path.splitext(image.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    unique_id = uuid.uuid4().hex[:8]
    clean_orig_name = os.path.splitext(image.filename)[0].replace(" ", "_")
    saved_filename = f"{clean_orig_name}_{unique_id}{ext}"
    upload_path = os.path.join(UPLOADS_DIR, saved_filename)

    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    img_cv = cv2.imread(upload_path)
    if img_cv is None:
        raise HTTPException(status_code=400, detail="Could not decode image file with OpenCV.")

    h, w = img_cv.shape[:2]

    # 1. Run Real EasyOCR Inference
    try:
        detections = run_ocr(img_cv, multi_pass=multi_pass, scale_if_small=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EasyOCR inference error: {str(e)}")

    # 2. Generate Annotated Bounding Box Image
    annotated_filename = f"annotated_{clean_orig_name}_{unique_id}.jpg"
    annotated_path = os.path.join(OUTPUTS_DIR, annotated_filename)
    try:
        generate_annotated_image(img_cv, detections, annotated_path)
        annotated_url = f"/outputs/{annotated_filename}"
    except Exception as e:
        print(f"[Warning] Failed to generate annotated image: {e}")
        annotated_url = None

    # 3. Evaluate 11 Statutory Declarations
    compliance_analysis = evaluate_compliance(
        detections=detections,
        inspection_type=inspection_type,
        evidence_image_url=annotated_url
    )

    full_text = " ".join(d["text"] for d in detections)
    total_time = round(time.time() - start_time, 2)

    # 4. Save to Scan History in SQLite
    user_id = current_user.get("user_id") if current_user else None
    user_role = current_user.get("role") if current_user else "anonymous"

    scan_record = ScanRecord(
        user_id=user_id,
        user_role=user_role,
        filename=image.filename,
        image_url=f"/outputs/{saved_filename}",
        annotated_image_url=annotated_url,
        compliance_status=compliance_analysis["overall_status"],
        total_detections=len(detections),
        violations_count=compliance_analysis["non_compliant_count"],
        processing_time_seconds=total_time,
        raw_ocr_json=json.dumps(detections),
        declarations_json=json.dumps(compliance_analysis)
    )
    db.add(scan_record)
    db.commit()

    return {
        "success": True,
        "scan_id": scan_record.id,
        "filename": image.filename,
        "image_width": w,
        "image_height": h,
        "processing_time_seconds": total_time,
        "total_detections": len(detections),
        "average_confidence": round(
            sum(d["confidence"] for d in detections) / len(detections), 4
        ) if detections else 0.0,
        "full_text": full_text,
        "detections": detections,
        "annotated_image_url": annotated_url,
        "compliance": compliance_analysis
    }

class ComplianceCheckRequest(BaseModel):
    detections: List[Dict[str, Any]]
    inspection_type: str = "physical_package"
    evidence_image_url: Optional[str] = None

@app.post("/api/compliance/check")
def check_compliance_direct(req: ComplianceCheckRequest):
    """
    Direct statutory compliance evaluation endpoint for arbitrary OCR detection payloads.
    """
    analysis = evaluate_compliance(
        detections=req.detections,
        inspection_type=req.inspection_type,
        evidence_image_url=req.evidence_image_url
    )
    return {
        "success": True,
        "compliance": analysis
    }

# ----------------- CONSUMER / USER WORKFLOW ENDPOINTS -----------------

@app.get("/api/user/dashboard")
def get_user_dashboard(user: dict = Depends(require_role(["user"])), db: Session = Depends(get_db)):
    user_id = user.get("user_id") or user.get("id")
    complaints = db.query(Complaint).filter(Complaint.consumer_id == user_id).order_by(Complaint.created_at.desc()).all()
    scans = db.query(ScanRecord).filter(ScanRecord.user_id == user_id).order_by(ScanRecord.created_at.desc()).all()

    under_review = sum(1 for c in complaints if c.status in ("SUBMITTED", "UNDER_REVIEW", "VERIFIED", "VIOLATION_CREATED"))
    resolved = sum(1 for c in complaints if c.status == "RESOLVED")
    compliant_scans = sum(1 for s in scans if s.compliance_status == "COMPLIANT")
    potential_violations = sum(1 for s in scans if s.compliance_status == "POTENTIAL_NON_COMPLIANCE")

    return {
        "user_name": user.get("name", "Consumer"),
        "stats": {
            "my_scans": len(scans),
            "products_scanned": len(scans),
            "compliance_checked": compliant_scans,
            "potential_violations": potential_violations,
            "my_complaints": len(complaints),
            "complaints_filed": len(complaints),
            "under_review": under_review,
            "resolved": resolved
        },
        "recent_complaints": [
            {
                "id": c.id,
                "complaint_code": c.complaint_code,
                "product_name": c.product_name,
                "brand": c.brand,
                "issue_type": c.issue_type,
                "status": c.status,
                "created_at": c.created_at.strftime("%d %b %Y")
            }
            for c in complaints[:5]
        ],
        "recent_scans": [
            {
                "id": s.id,
                "filename": s.filename,
                "status": s.compliance_status or "REVIEW_REQUIRED",
                "compliance_status": s.compliance_status or "REVIEW_REQUIRED",
                "violations_count": s.violations_count,
                "date": s.created_at.strftime("%d %b %Y"),
                "created_at": s.created_at.strftime("%d %b %Y")
            }
            for s in scans[:5]
        ]
    }

@app.get("/api/user/scans")
def get_user_scans(user: dict = Depends(require_role(["user"])), db: Session = Depends(get_db)):
    user_id = user.get("user_id") or user.get("id")
    scans = db.query(ScanRecord).filter(ScanRecord.user_id == user_id).order_by(ScanRecord.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "filename": s.filename,
            "compliance_status": s.compliance_status,
            "violations_count": s.violations_count,
            "processing_time_seconds": s.processing_time_seconds,
            "annotated_image_url": s.annotated_image_url,
            "created_at": s.created_at.strftime("%d %b %Y"),
            "declarations": json.loads(s.declarations_json) if s.declarations_json else None
        }
        for s in scans
    ]

@app.get("/api/user/complaints")
def get_user_complaints(user: dict = Depends(require_role(["user"])), db: Session = Depends(get_db)):
    user_id = user.get("user_id") or user.get("id")
    complaints = db.query(Complaint).filter(Complaint.consumer_id == user_id).order_by(Complaint.created_at.desc()).all()
    return [
        {
            "id": c.id,
            "complaint_code": c.complaint_code,
            "product_name": c.product_name,
            "brand": c.brand,
            "manufacturer_name": c.manufacturer_name,
            "issue_type": c.issue_type,
            "description": c.description,
            "status": c.status,
            "evidence_image_url": c.evidence_image_url,
            "rule_id": c.rule_id,
            "violation_code": c.violation_code,
            "assigned_officer": c.assigned_officer,
            "created_at": c.created_at.strftime("%d %b %Y"),
            "updated_at": c.updated_at.strftime("%d %b %Y")
        }
        for c in complaints
    ]

@app.post("/api/user/complaints")
def create_user_complaint(
    req: ComplaintCreate,
    user: dict = Depends(require_role(["user"])),
    db: Session = Depends(get_db)
):
    last_c = db.query(Complaint).order_by(Complaint.id.desc()).first()
    next_num = (last_c.id + 1) if last_c else 1
    while True:
        complaint_code = f"LM-CMP-2026-{next_num:04d}"
        if not db.query(Complaint).filter(Complaint.complaint_code == complaint_code).first():
            break
        next_num += 1
    user_id = user.get("user_id") or user.get("id")

    complaint = Complaint(
        complaint_code=complaint_code,
        consumer_id=user_id,
        consumer_name=user["name"],
        product_name=req.product_name,
        brand=req.brand,
        manufacturer_name=req.manufacturer_name or "ABC Foods Pvt Ltd",
        issue_type=req.issue_type,
        description=req.description,
        status="SUBMITTED",
        evidence_image_url=req.evidence_image_url,
        ocr_scan_id=req.ocr_scan_id,
        detected_declarations_json=req.detected_declarations_json,
        compliance_status=req.compliance_status or "POTENTIAL_NON_COMPLIANCE",
        rule_id=req.rule_id or "LM-06",
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(complaint)
    db.commit()

    # Create Notification for Officers
    create_notification(
        db=db,
        recipient_user_id=None,
        recipient_role="officer",
        notif_type="NEW_COMPLAINT",
        title="New Consumer Complaint",
        message=f"New Consumer Complaint {complaint_code} requires review.",
        entity_type="complaint",
        entity_id=complaint_code,
        action_url="/officer/complaints"
    )

    # Log Audit
    log_audit(
        db=db,
        user=user,
        action="Complaint Submitted",
        entity_type="complaint",
        entity_id=complaint_code,
        details=f"Filed complaint for {req.product_name} regarding {req.issue_type}."
    )

    return {
        "success": True,
        "complaint_code": complaint_code,
        "complaint_id": complaint.id,
        "status": "SUBMITTED",
        "message": "Complaint submitted successfully. An enforcement officer will review it shortly."
    }

# ----------------- OFFICER ENFORCEMENT ENDPOINTS -----------------

@app.get("/api/officer/dashboard")
def get_officer_dashboard(user: dict = Depends(require_role(["officer"])), db: Session = Depends(get_db)):
    complaints = db.query(Complaint).all()
    violations = db.query(Violation).all()
    cas = db.query(CorrectiveAction).all()
    inspections = db.query(Inspection).all()

    new_complaints = sum(1 for c in complaints if c.status in ("SUBMITTED", "UNDER_REVIEW"))
    vios_under_review = sum(1 for v in violations if v.status in ("OPEN", "UNDER_REVIEW"))
    cas_awaiting = sum(1 for ca in cas if ca.status == "PENDING_OFFICER_REVIEW")

    return {
        "officer_name": user["name"],
        "stats": {
            "total_inspections": len(inspections),
            "open_violations": sum(1 for v in violations if v.status == "OPEN"),
            "resolved_violations": sum(1 for v in violations if v.status == "RESOLVED"),
            "total_complaints": len(complaints)
        },
        "pending_actions": {
            "new_complaints": new_complaints,
            "violations_under_review": vios_under_review,
            "corrective_actions_awaiting_decision": cas_awaiting
        },
        "recent_complaints": [
            {
                "id": c.id,
                "complaint_code": c.complaint_code,
                "product_name": c.product_name,
                "consumer_name": c.consumer_name,
                "issue_type": c.issue_type,
                "status": c.status,
                "created_at": c.created_at.strftime("%d %b %Y")
            }
            for c in sorted(complaints, key=lambda x: x.created_at, reverse=True)[:5]
        ],
        "recent_violations": [
            {
                "id": v.id,
                "violation_code": v.violation_code,
                "product_name": v.product_name,
                "manufacturer_name": v.manufacturer_name,
                "rule_id": v.rule_id,
                "severity": v.severity,
                "status": v.status
            }
            for v in sorted(violations, key=lambda x: x.created_at, reverse=True)[:5]
        ]
    }

@app.get("/api/officer/complaints")
def get_officer_complaints(user: dict = Depends(require_role(["officer"])), db: Session = Depends(get_db)):
    complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    return [
        {
            "id": c.id,
            "complaint_code": c.complaint_code,
            "consumer_id": c.consumer_id,
            "consumer_name": c.consumer_name,
            "product_name": c.product_name,
            "brand": c.brand,
            "manufacturer_name": c.manufacturer_name,
            "issue_type": c.issue_type,
            "description": c.description,
            "status": c.status,
            "evidence_image_url": c.evidence_image_url,
            "rule_id": c.rule_id,
            "violation_code": c.violation_code,
            "assigned_officer": c.assigned_officer or user["name"],
            "created_at": c.created_at.strftime("%d %b %Y, %H:%M")
        }
        for c in complaints
    ]

@app.get("/api/officer/complaints/{complaint_id}")
def get_officer_complaint_detail(complaint_id: int, user: dict = Depends(require_role(["officer"])), db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    scan = None
    if c.ocr_scan_id:
        scan_rec = db.query(ScanRecord).filter(ScanRecord.id == c.ocr_scan_id).first()
        if scan_rec:
            scan = {
                "id": scan_rec.id,
                "raw_ocr": json.loads(scan_rec.raw_ocr_json or "[]"),
                "declarations": json.loads(scan_rec.declarations_json or "[]"),
                "annotated_image_url": scan_rec.annotated_image_url,
                "total_detections": scan_rec.total_detections,
                "processing_time": scan_rec.processing_time_seconds
            }
    return {
        "id": c.id,
        "complaint_code": c.complaint_code,
        "consumer_name": c.consumer_name,
        "product_name": c.product_name,
        "brand": c.brand,
        "manufacturer_name": c.manufacturer_name,
        "issue_type": c.issue_type,
        "description": c.description,
        "status": c.status,
        "evidence_image_url": c.evidence_image_url,
        "rule_id": c.rule_id,
        "compliance_status": c.compliance_status,
        "violation_code": c.violation_code,
        "assigned_officer": c.assigned_officer,
        "officer_remarks": c.officer_remarks,
        "rejection_reason": c.rejection_reason,
        "created_at": c.created_at.strftime("%d %b %Y, %H:%M"),
        "scan_data": scan
    }

@app.post("/api/officer/complaints/{complaint_id}/verify")
def verify_complaint_and_create_violation(
    complaint_id: int,
    req: ComplaintVerifyRequest,
    user: dict = Depends(require_role(["officer"])),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if complaint.status in ("RESOLVED", "REJECTED", "CLOSED"):
        raise HTTPException(status_code=400, detail=f"Cannot verify complaint in '{complaint.status}' status.")

    mfg_name = complaint.manufacturer_name or "ABC Foods Pvt Ltd"
    mfg_user = db.query(User).filter(User.company_name == mfg_name).first()

    last_v = db.query(Violation).order_by(Violation.id.desc()).first()
    next_num = (last_v.id + 1) if last_v else 1
    while True:
        violation_code = f"LM-VIO-2026-{next_num:04d}"
        if not db.query(Violation).filter(Violation.violation_code == violation_code).first():
            break
        next_num += 1
    user_id = user.get("user_id") or user.get("id")

    violation = Violation(
        violation_code=violation_code,
        complaint_id=complaint.id,
        complaint_code=complaint.complaint_code,
        product_name=complaint.product_name,
        brand=complaint.brand,
        manufacturer_name=mfg_name,
        rule_id=req.rule_id,
        rule_name=req.rule_name,
        severity=req.severity,
        status="OPEN",
        reason=req.reason,
        extracted_value=complaint.description,
        ocr_text=complaint.description,
        evidence_image_url=complaint.evidence_image_url,
        annotated_image_url=complaint.evidence_image_url,
        officer_public_finding=req.officer_public_finding or req.reason,
        officer_notes=req.officer_notes,
        officer_id=user_id,
        officer_name=user["name"],
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(violation)
    db.commit()

    complaint.status = "VIOLATION_CREATED"
    complaint.violation_id = violation.id
    complaint.violation_code = violation_code
    complaint.assigned_officer = user["name"]
    complaint.updated_at = datetime.datetime.utcnow()
    db.commit()

    # Notify ONLY the relevant manufacturer
    mfg_user_id = mfg_user.id if mfg_user else None
    create_notification(
        db=db,
        recipient_user_id=mfg_user_id,
        recipient_role="manufacturer",
        notif_type="VIOLATION_CREATED",
        title="Statutory Notice Issued",
        message=f"New Legal Metrology violation {violation_code} requires corrective action.",
        entity_type="violation",
        entity_id=violation_code,
        action_url="/manufacturer/violations"
    )

    log_audit(
        db=db,
        user=user,
        action="Complaint Verified",
        entity_type="complaint",
        entity_id=complaint.complaint_code,
        details=f"Officer verified violation under {req.rule_id} and opened {violation_code}."
    )
    log_audit(
        db=db,
        user=user,
        action="Violation Created",
        entity_type="violation",
        entity_id=violation_code,
        details=f"Statutory notice issued to {mfg_name} for rule {req.rule_id} ({req.rule_name})."
    )

    return {
        "success": True,
        "violation_code": violation_code,
        "complaint_status": "VIOLATION_CREATED",
        "message": f"Complaint verified. Violation notice {violation_code} issued to {mfg_name}."
    }

@app.post("/api/officer/complaints/{complaint_id}/reject")
def reject_complaint(
    complaint_id: int,
    req: ComplaintRejectRequest,
    user: dict = Depends(require_role(["officer"])),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = "REJECTED"
    complaint.rejection_reason = req.rejection_reason
    complaint.assigned_officer = user["name"]
    complaint.updated_at = datetime.datetime.utcnow()
    db.commit()

    create_notification(
        db=db,
        recipient_user_id=complaint.consumer_id,
        recipient_role="user",
        notif_type="COMPLAINT_REJECTED",
        title="Complaint Closed",
        message=f"Your complaint {complaint.complaint_code} was reviewed and closed: {req.rejection_reason}",
        entity_type="complaint",
        entity_id=complaint.complaint_code,
        action_url="/user/complaints"
    )

    log_audit(
        db=db,
        user=user,
        action="Complaint Rejected",
        entity_type="complaint",
        entity_id=complaint.complaint_code,
        details=f"Officer rejected complaint: {req.rejection_reason}"
    )

    return {"success": True, "message": f"Complaint {complaint.complaint_code} rejected."}

# ----------------- UNIFIED OFFICER CASE VIEW & CORRECTIVE ACTION REVIEWS -----------------

@app.get("/api/officer/cases/{case_identifier}")
def get_unified_case_detail(case_identifier: str, user: dict = Depends(require_role(["officer"])), db: Session = Depends(get_db)):
    vio = None
    # 1. Try numeric lookup (by violation ID or complaint ID)
    if str(case_identifier).isdigit():
        int_id = int(case_identifier)
        vio = db.query(Violation).filter(Violation.id == int_id).first()
        if not vio:
            vio = db.query(Violation).filter(Violation.complaint_id == int_id).first()

    # 2. Try code string lookup (by violation_code or complaint_code)
    if not vio:
        vio = db.query(Violation).filter(
            (Violation.violation_code == str(case_identifier)) |
            (Violation.complaint_code == str(case_identifier))
        ).first()

    # 3. Fallback: Check if numeric complaint exists with linked violation_code
    if not vio and str(case_identifier).isdigit():
        cmp = db.query(Complaint).filter(Complaint.id == int(case_identifier)).first()
        if cmp and cmp.violation_code:
            vio = db.query(Violation).filter(Violation.violation_code == cmp.violation_code).first()

    if not vio:
        raise HTTPException(status_code=404, detail="Case/Violation not found")

    complaint = db.query(Complaint).filter(Complaint.id == vio.complaint_id).first() if vio.complaint_id else None
    cas = db.query(CorrectiveAction).filter(CorrectiveAction.violation_id == vio.id).order_by(CorrectiveAction.submitted_at.desc()).all()
    audit_logs = db.query(AuditLog).filter(
        (AuditLog.entity_id == vio.violation_code) |
        (AuditLog.entity_id == (complaint.complaint_code if complaint else ""))
    ).order_by(AuditLog.timestamp.asc()).all()

    rule_meta = RULES_REGISTRY.get(vio.rule_id, {
        "name": vio.rule_name,
        "category": "Mandatory Statutory Declaration",
        "statutory_source": "Legal Metrology PCR 2011",
        "description": vio.reason
    })

    return {
        "case_id": vio.violation_code,
        "violation": {
            "id": vio.id,
            "violation_code": vio.violation_code,
            "product_name": vio.product_name,
            "brand": vio.brand,
            "manufacturer_name": vio.manufacturer_name,
            "rule_id": vio.rule_id,
            "rule_name": vio.rule_name,
            "severity": vio.severity,
            "status": vio.status,
            "reason": vio.reason,
            "extracted_value": vio.extracted_value,
            "evidence_image_url": vio.evidence_image_url,
            "annotated_image_url": vio.annotated_image_url,
            "officer_public_finding": vio.officer_public_finding,
            "officer_notes": vio.officer_notes,
            "created_at": vio.created_at.strftime("%d %b %Y, %H:%M"),
            "rule_metadata": rule_meta
        },
        "complaint": {
            "complaint_code": complaint.complaint_code if complaint else "N/A",
            "consumer_name": complaint.consumer_name if complaint else "Public Grievance",
            "issue_type": complaint.issue_type if complaint else "Direct Audit",
            "description": complaint.description if complaint else "Inspector initiation",
            "status": complaint.status if complaint else "N/A",
            "created_at": complaint.created_at.strftime("%d %b %Y, %H:%M") if complaint else ""
        } if complaint else None,
        "corrective_actions": [
            {
                "id": ca.id,
                "ca_code": ca.ca_code,
                "what_was_changed": ca.what_was_changed,
                "proposed_resolution": ca.proposed_resolution,
                "explanation": ca.explanation,
                "corrected_image_url": ca.corrected_image_url,
                "supporting_docs_url": ca.supporting_docs_url,
                "manufacturer_comments": ca.manufacturer_comments,
                "status": ca.status,
                "officer_review_decision": ca.officer_review_decision,
                "officer_review_notes": ca.officer_review_notes,
                "submitted_at": ca.submitted_at.strftime("%d %b %Y, %H:%M"),
                "reviewed_at": ca.reviewed_at.strftime("%d %b %Y, %H:%M") if ca.reviewed_at else None
            }
            for ca in cas
        ],
        "audit_timeline": [
            {
                "action": l.action,
                "user_name": l.user_name,
                "user_role": l.user_role,
                "details": l.details,
                "timestamp": l.timestamp.strftime("%d %b %Y, %H:%M:%S")
            }
            for l in audit_logs
        ]
    }

@app.get("/api/officer/corrective-actions")
def get_officer_corrective_actions(user: dict = Depends(require_role(["officer"])), db: Session = Depends(get_db)):
    cas = db.query(CorrectiveAction).order_by(CorrectiveAction.submitted_at.desc()).all()
    res = []
    for ca in cas:
        vio = db.query(Violation).filter(Violation.violation_code == ca.violation_code).first()
        res.append({
            "id": ca.id,
            "ca_code": ca.ca_code,
            "violation_id": vio.id if vio else None,
            "violation_code": ca.violation_code,
            "product_name": ca.product_name,
            "manufacturer_name": ca.manufacturer_name,
            "what_was_changed": ca.what_was_changed,
            "proposed_resolution": ca.proposed_resolution,
            "explanation": ca.explanation,
            "corrected_image_url": ca.corrected_image_url,
            "supporting_docs_url": ca.supporting_docs_url,
            "status": ca.status,
            "original_evidence_image_url": (vio.evidence_image_url or vio.annotated_image_url) if vio else None,
            "rule_id": vio.rule_id if vio else "LM-06",
            "rule_name": vio.rule_name if vio else "Mandatory Declaration",
            "violation_reason": vio.reason if vio else "Statutory non-compliance",
            "submitted_at": ca.submitted_at.strftime("%d %b %Y, %H:%M"),
            "reviewed_at": ca.reviewed_at.strftime("%d %b %Y, %H:%M") if ca.reviewed_at else None
        })
    return res

@app.post("/api/officer/corrective-actions/{ca_id}/decision")
def execute_corrective_action_decision(
    ca_id: int,
    req: OfficerDecisionRequest,
    user: dict = Depends(require_role(["officer"])),
    db: Session = Depends(get_db)
):
    ca = db.query(CorrectiveAction).filter(CorrectiveAction.id == ca_id).first()
    if not ca:
        raise HTTPException(status_code=404, detail="Corrective Action not found")

    decision = req.decision.upper()
    if decision not in ("APPROVE", "DENY", "REQUEST_REVISION", "ESCALATE"):
        raise HTTPException(status_code=400, detail="Invalid decision. Choose APPROVE, DENY, REQUEST_REVISION, or ESCALATE.")

    vio = db.query(Violation).filter(Violation.violation_code == ca.violation_code).first()
    complaint = db.query(Complaint).filter(Complaint.id == vio.complaint_id).first() if vio and vio.complaint_id else None
    mfg_user = db.query(User).filter(User.company_name == ca.manufacturer_name).first()

    ca.officer_review_decision = decision
    ca.officer_review_notes = req.officer_notes or req.reason
    ca.reviewed_at = datetime.datetime.utcnow()

    if decision == "APPROVE":
        ca.status = "APPROVED"
        if vio:
            vio.status = "RESOLVED"
            vio.updated_at = datetime.datetime.utcnow()
        if complaint:
            complaint.status = "RESOLVED"
            complaint.updated_at = datetime.datetime.utcnow()

        create_notification(
            db=db,
            recipient_user_id=mfg_user.id if mfg_user else None,
            recipient_role="manufacturer",
            notif_type="CORRECTIVE_ACTION_APPROVED",
            title="Corrective Action Approved",
            message=f"Corrective action for {ca.violation_code} was approved by Legal Metrology Officer.",
            entity_type="violation",
            entity_id=ca.violation_code,
            action_url="/manufacturer/violations"
        )

        if complaint:
            create_notification(
                db=db,
                recipient_user_id=complaint.consumer_id,
                recipient_role="user",
                notif_type="COMPLAINT_RESOLVED",
                title="Complaint Resolved",
                message=f"Your complaint {complaint.complaint_code} has been reviewed, manufacturer remediated, and case resolved.",
                entity_type="complaint",
                entity_id=complaint.complaint_code,
                action_url="/user/complaints"
            )

        log_audit(
            db=db,
            user=user,
            action="Corrective Action Approved",
            entity_type="corrective_action",
            entity_id=ca.ca_code,
            details=f"Approved remedy for {ca.violation_code}. Case resolved."
        )

    elif decision == "DENY":
        if not req.reason:
            raise HTTPException(status_code=400, detail="Officer reason is required when denying a corrective action.")
        ca.status = "DENIED"
        if vio:
            vio.status = "OPEN"
            vio.updated_at = datetime.datetime.utcnow()

        create_notification(
            db=db,
            recipient_user_id=mfg_user.id if mfg_user else None,
            recipient_role="manufacturer",
            notif_type="CORRECTIVE_ACTION_DENIED",
            title="Corrective Action Denied",
            message=f"Corrective action for {ca.violation_code} was denied: {req.reason}. Please resubmit remedy.",
            entity_type="violation",
            entity_id=ca.violation_code,
            action_url="/manufacturer/violations"
        )

        log_audit(
            db=db,
            user=user,
            action="Corrective Action Denied",
            entity_type="corrective_action",
            entity_id=ca.ca_code,
            details=f"Denied remedy for {ca.violation_code}: {req.reason}"
        )

    elif decision == "REQUEST_REVISION":
        if not (req.officer_notes or req.reason):
            raise HTTPException(status_code=400, detail="Officer comments are required to request revisions.")
        ca.status = "REVISION_REQUIRED"
        if vio:
            vio.status = "UNDER_REVIEW"
            vio.updated_at = datetime.datetime.utcnow()

        create_notification(
            db=db,
            recipient_user_id=mfg_user.id if mfg_user else None,
            recipient_role="manufacturer",
            notif_type="REVISION_REQUIRED",
            title="Remedy Revision Requested",
            message=f"Officer requested revision for {ca.violation_code}: {req.officer_notes or req.reason}",
            entity_type="violation",
            entity_id=ca.violation_code,
            action_url="/manufacturer/violations"
        )

        log_audit(
            db=db,
            user=user,
            action="Revision Requested",
            entity_type="corrective_action",
            entity_id=ca.ca_code,
            details=f"Requested revision: {req.officer_notes or req.reason}"
        )

    elif decision == "ESCALATE":
        if not req.reason:
            raise HTTPException(status_code=400, detail="Officer reason is required to escalate enforcement.")
        if vio:
            vio.status = "ESCALATED"
            vio.escalation_reason = req.reason
            vio.updated_at = datetime.datetime.utcnow()

        create_notification(
            db=db,
            recipient_user_id=mfg_user.id if mfg_user else None,
            recipient_role="manufacturer",
            notif_type="VIOLATION_ESCALATED",
            title="Notice Escalated",
            message=f"Notice {ca.violation_code} has been ESCALATED for formal statutory prosecution: {req.reason}",
            entity_type="violation",
            entity_id=ca.violation_code,
            action_url="/manufacturer/violations"
        )

        log_audit(
            db=db,
            user=user,
            action="Violation Escalated",
            entity_type="violation",
            entity_id=ca.violation_code,
            details=f"Officer escalated violation: {req.reason}"
        )

    db.commit()

    return {
        "success": True,
        "decision": decision,
        "corrective_action_status": ca.status,
        "violation_status": vio.status if vio else "N/A",
        "message": f"Officer decision '{decision}' executed successfully."
    }

# ----------------- MANUFACTURER WORKFLOW ENDPOINTS (STRICT DATA ISOLATION) -----------------

@app.get("/api/manufacturer/dashboard")
def get_manufacturer_dashboard(user: dict = Depends(require_role(["manufacturer"])), db: Session = Depends(get_db)):
    company = user.get("company_name", "ABC Foods Pvt Ltd")
    my_products = db.query(Product).filter(Product.manufacturer_name == company).all()
    my_violations = db.query(Violation).filter(Violation.manufacturer_name == company).order_by(Violation.created_at.desc()).all()
    my_actions = db.query(CorrectiveAction).filter(CorrectiveAction.manufacturer_name == company).order_by(CorrectiveAction.submitted_at.desc()).all()

    open_vios = sum(1 for v in my_violations if v.status == "OPEN")
    under_review_vios = sum(1 for v in my_violations if v.status == "UNDER_REVIEW")
    resolved_vios = sum(1 for v in my_violations if v.status == "RESOLVED")
    pending_cas = sum(1 for a in my_actions if a.status == "PENDING_OFFICER_REVIEW")

    return {
        "company_name": company,
        "manager_name": user["name"],
        "stats": {
            "registered_products": len(my_products),
            "open_violations": open_vios,
            "violations_under_review": under_review_vios,
            "resolved_violations": resolved_vios,
            "corrective_actions_pending": pending_cas
        },
        "recent_violations": [
            {
                "id": v.id,
                "violation_code": v.violation_code,
                "product_name": v.product_name,
                "rule_id": v.rule_id,
                "severity": v.severity,
                "status": v.status,
                "created_at": v.created_at.strftime("%d %b %Y")
            }
            for v in my_violations[:5]
        ],
        "products": [
            {
                "id": p.id,
                "product_code": p.product_code,
                "name": p.name,
                "brand": p.brand,
                "pack_size": p.pack_size,
                "mrp": p.mrp,
                "status": p.compliance_status
            }
            for p in my_products
        ]
    }

@app.get("/api/manufacturer/violations")
def get_manufacturer_violations(user: dict = Depends(require_role(["manufacturer"])), db: Session = Depends(get_db)):
    company = user.get("company_name", "ABC Foods Pvt Ltd")
    violations = db.query(Violation).filter(Violation.manufacturer_name == company).order_by(Violation.created_at.desc()).all()
    return [
        {
            "id": v.id,
            "violation_code": v.violation_code,
            "complaint_code": v.complaint_code,
            "product_name": v.product_name,
            "brand": v.brand,
            "rule_id": v.rule_id,
            "rule_name": v.rule_name,
            "severity": v.severity,
            "status": v.status,
            "reason": v.reason,
            "extracted_value": v.extracted_value,
            "evidence_image_url": v.evidence_image_url,
            "annotated_image_url": v.annotated_image_url,
            "officer_public_finding": v.officer_public_finding,
            "created_at": v.created_at.strftime("%d %b %Y, %H:%M")
        }
        for v in violations
    ]

@app.get("/api/manufacturer/violations/{violation_id}")
def get_manufacturer_violation_detail(violation_id: int, user: dict = Depends(require_role(["manufacturer"])), db: Session = Depends(get_db)):
    company = user.get("company_name", "ABC Foods Pvt Ltd")
    v = db.query(Violation).filter(Violation.id == violation_id, Violation.manufacturer_name == company).first()
    if not v:
        raise HTTPException(status_code=403, detail="Access denied: Violation does not belong to your company catalog.")

    ca = db.query(CorrectiveAction).filter(CorrectiveAction.violation_id == v.id).order_by(CorrectiveAction.submitted_at.desc()).first()

    return {
        "id": v.id,
        "violation_code": v.violation_code,
        "complaint_code": v.complaint_code,
        "product_name": v.product_name,
        "brand": v.brand,
        "rule_id": v.rule_id,
        "rule_name": v.rule_name,
        "severity": v.severity,
        "status": v.status,
        "reason": v.reason,
        "extracted_value": v.extracted_value,
        "ocr_text": v.ocr_text,
        "evidence_image_url": v.evidence_image_url,
        "annotated_image_url": v.annotated_image_url,
        "officer_public_finding": v.officer_public_finding,
        "created_at": v.created_at.strftime("%d %b %Y, %H:%M"),
        "latest_corrective_action": {
            "ca_code": ca.ca_code,
            "status": ca.status,
            "explanation": ca.explanation,
            "officer_review_notes": ca.officer_review_notes,
            "submitted_at": ca.submitted_at.strftime("%d %b %Y, %H:%M")
        } if ca else None
    }

@app.post("/api/manufacturer/corrective-actions")
def submit_manufacturer_corrective_action(
    req: CorrectiveActionCreate,
    user: dict = Depends(require_role(["manufacturer"])),
    db: Session = Depends(get_db)
):
    company = user.get("company_name", "ABC Foods Pvt Ltd")
    user_id = user.get("user_id") or user.get("id")
    vio = db.query(Violation).filter(Violation.violation_code == req.violation_code, Violation.manufacturer_name == company).first()
    if not vio:
        raise HTTPException(status_code=403, detail=f"Access denied: Violation '{req.violation_code}' does not belong to {company}.")

    last_ca = db.query(CorrectiveAction).order_by(CorrectiveAction.id.desc()).first()
    next_num = (last_ca.id + 1) if last_ca else 1
    while True:
        ca_code = f"LM-CA-2026-{next_num:04d}"
        if not db.query(CorrectiveAction).filter(CorrectiveAction.ca_code == ca_code).first():
            break
        next_num += 1

    ca = CorrectiveAction(
        ca_code=ca_code,
        violation_id=vio.id,
        violation_code=vio.violation_code,
        complaint_id=vio.complaint_id,
        complaint_code=vio.complaint_code,
        manufacturer_id=user_id,
        manufacturer_name=company,
        product_name=vio.product_name,
        what_was_changed=req.what_was_changed or "Adjusted packaging artwork cylinder.",
        proposed_resolution=req.proposed_resolution or "Updated upcoming production batches.",
        explanation=req.explanation,
        corrected_image_url=req.corrected_image_url,
        supporting_docs_url=req.supporting_docs_url,
        manufacturer_comments=req.manufacturer_comments,
        status="PENDING_OFFICER_REVIEW",
        submitted_at=datetime.datetime.utcnow()
    )
    db.add(ca)

    vio.status = "UNDER_REVIEW"
    vio.updated_at = datetime.datetime.utcnow()
    db.commit()

    create_notification(
        db=db,
        recipient_user_id=None,
        recipient_role="officer",
        notif_type="CORRECTIVE_ACTION_SUBMITTED",
        title="Manufacturer Submitted Remedy",
        message=f"Manufacturer {company} submitted corrective action for {vio.violation_code}.",
        entity_type="corrective_action",
        entity_id=ca_code,
        action_url="/officer/corrective-actions"
    )

    log_audit(
        db=db,
        user=user,
        action="Corrective Action Submitted",
        entity_type="corrective_action",
        entity_id=ca_code,
        details=f"Submitted remedy for {vio.violation_code}: {req.explanation[:100]}"
    )

    return {
        "success": True,
        "ca_code": ca_code,
        "status": "PENDING_OFFICER_REVIEW",
        "violation_status": "UNDER_REVIEW",
        "message": "Corrective action submitted. Awaiting Legal Metrology Officer review."
    }

@app.post("/api/manufacturer/violations/{violation_id}/corrective-action")
def submit_violation_corrective_action_by_id(
    violation_id: int,
    req: CorrectiveActionCreate,
    user: dict = Depends(require_role(["manufacturer"])),
    db: Session = Depends(get_db)
):
    company = user.get("company_name", "ABC Foods Pvt Ltd")
    vio = db.query(Violation).filter(Violation.id == violation_id, Violation.manufacturer_name == company).first()
    if not vio:
        vio = db.query(Violation).filter(Violation.id == violation_id).first()
    if not vio:
        raise HTTPException(status_code=404, detail="Violation record not found")
    req.violation_code = vio.violation_code
    return submit_manufacturer_corrective_action(req=req, user=user, db=db)

@app.get("/api/manufacturer/corrective-actions")
def get_manufacturer_corrective_actions(user: dict = Depends(require_role(["manufacturer"])), db: Session = Depends(get_db)):
    company = user.get("company_name", "ABC Foods Pvt Ltd")
    cas = db.query(CorrectiveAction).filter(CorrectiveAction.manufacturer_name == company).order_by(CorrectiveAction.submitted_at.desc()).all()
    return [
        {
            "id": a.id,
            "ca_code": a.ca_code,
            "violation_code": a.violation_code,
            "product_name": a.product_name,
            "what_was_changed": a.what_was_changed,
            "proposed_resolution": a.proposed_resolution,
            "explanation": a.explanation,
            "corrected_image_url": a.corrected_image_url,
            "status": a.status,
            "officer_review_decision": a.officer_review_decision,
            "officer_review_notes": a.officer_review_notes,
            "submitted_at": a.submitted_at.strftime("%d %b %Y, %H:%M"),
            "reviewed_at": a.reviewed_at.strftime("%d %b %Y, %H:%M") if a.reviewed_at else None
        }
        for a in cas
    ]

# ----------------- PRODUCT & INSPECTION REPOSITORY -----------------

@app.get("/api/officer/products")
def get_all_products(user: dict = Depends(require_role(["officer"])), db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "product_code": p.product_code,
            "name": p.name,
            "brand": p.brand,
            "category": p.category,
            "pack_size": p.pack_size,
            "mrp": p.mrp,
            "barcode": p.barcode,
            "manufacturer_name": p.manufacturer_name,
            "compliance_status": p.compliance_status,
            "created_at": p.created_at.strftime("%d %b %Y")
        }
        for p in products
    ]

@app.get("/api/manufacturer/products")
def get_manufacturer_products(user: dict = Depends(require_role(["manufacturer"])), db: Session = Depends(get_db)):
    company = user.get("company_name", "ABC Foods Pvt Ltd")
    products = db.query(Product).filter(Product.manufacturer_name == company).order_by(Product.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "product_code": p.product_code,
            "name": p.name,
            "brand": p.brand,
            "category": p.category,
            "pack_size": p.pack_size,
            "mrp": p.mrp,
            "barcode": p.barcode,
            "manufacturer_name": p.manufacturer_name,
            "compliance_status": p.compliance_status,
            "created_at": p.created_at.strftime("%d %b %Y")
        }
        for p in products
    ]

@app.delete("/api/manufacturer/products/{product_id}")
def delete_manufacturer_product(
    product_id: int,
    user: dict = Depends(require_role(["manufacturer"])),
    db: Session = Depends(get_db)
):
    company = user.get("company_name", "ABC Foods Pvt Ltd")
    product = db.query(Product).filter(Product.id == product_id, Product.manufacturer_name == company).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found in your catalog")

    db.delete(product)
    db.commit()
    return {"success": True, "message": "Product removed from catalog"}

@app.get("/api/officer/inspections")
def get_officer_inspections(user: dict = Depends(require_role(["officer"])), db: Session = Depends(get_db)):
    inspections = db.query(Inspection).order_by(Inspection.created_at.desc()).all()
    return [
        {
            "id": i.id,
            "inspection_code": i.inspection_code,
            "product_name": i.product_name,
            "manufacturer_name": i.manufacturer_name,
            "officer_name": i.officer_name,
            "inspection_type": i.inspection_type,
            "compliance_status": i.compliance_status,
            "violations_count": i.violations_count,
            "officer_remarks": i.officer_remarks,
            "status": i.status,
            "created_at": i.created_at.strftime("%d %b %Y, %H:%M")
        }
        for i in inspections
    ]

@app.post("/api/officer/inspections")
def create_officer_inspection(
    req: InspectionCreate,
    user: dict = Depends(require_role(["officer"])),
    db: Session = Depends(get_db)
):
    count = db.query(Inspection).count() + 1
    inspection_code = f"INS-2026-{count:03d}"
    user_id = user.get("user_id") or user.get("id")

    ins = Inspection(
        inspection_code=inspection_code,
        product_name=req.product_name,
        manufacturer_name=req.manufacturer_name,
        officer_id=user_id,
        officer_name=user["name"],
        inspection_type=req.inspection_type,
        compliance_status=req.compliance_status,
        violations_count=req.violations_count,
        evidence_image_url=req.evidence_image_url,
        officer_remarks=req.officer_remarks,
        declarations_json=req.declarations_json,
        status="Completed",
        created_at=datetime.datetime.utcnow()
    )
    db.add(ins)
    db.commit()

    return {
        "success": True,
        "inspection_code": inspection_code,
        "id": ins.id,
        "message": f"Inspection record {inspection_code} logged successfully."
    }

@app.get("/api/officer/violations")
def get_officer_violations(user: dict = Depends(require_role(["officer"])), db: Session = Depends(get_db)):
    violations = db.query(Violation).order_by(Violation.created_at.desc()).all()
    return [
        {
            "id": v.id,
            "violation_code": v.violation_code,
            "complaint_code": v.complaint_code,
            "product_name": v.product_name,
            "manufacturer_name": v.manufacturer_name,
            "rule_id": v.rule_id,
            "rule_name": v.rule_name,
            "severity": v.severity,
            "status": v.status,
            "reason": v.reason,
            "extracted_value": v.extracted_value,
            "ocr_text": v.ocr_text,
            "evidence_image_url": v.evidence_image_url,
            "officer_remarks": v.officer_public_finding or v.officer_notes,
            "created_at": v.created_at.strftime("%d %b %Y, %H:%M")
        }
        for v in violations
    ]

@app.post("/api/officer/violations/{violation_id}/status")
def update_violation_status(
    violation_id: int,
    req: StatusUpdateRequest,
    user: dict = Depends(require_role(["officer"])),
    db: Session = Depends(get_db)
):
    v = db.query(Violation).filter(Violation.id == violation_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Violation notice not found")

    status_upper = req.status.upper().replace(" ", "_")
    v.status = status_upper
    if req.remarks:
        v.officer_notes = req.remarks
        v.officer_public_finding = req.remarks
    v.updated_at = datetime.datetime.utcnow()
    db.commit()

    log_audit(
        db=db,
        user=user,
        action="Violation Status Updated",
        entity_type="violation",
        entity_id=v.violation_code,
        details=f"Status updated to {v.status}. Remarks: {req.remarks or 'N/A'}"
    )

    mfg_user = db.query(User).filter(User.company_name == v.manufacturer_name).first()
    if mfg_user:
        create_notification(
            db=db,
            recipient_user_id=mfg_user.id,
            recipient_role="manufacturer",
            notif_type="VIOLATION_UPDATED",
            title="Violation Notice Updated",
            message=f"Notice {v.violation_code} status set to {v.status} by Officer {user['name']}.",
            entity_type="violation",
            entity_id=v.violation_code,
            action_url="/manufacturer/violations"
        )

    return {
        "success": True,
        "violation_code": v.violation_code,
        "status": v.status,
        "message": f"Notice {v.violation_code} status updated to {v.status}."
    }

@app.delete("/api/officer/violations/{violation_id}")
def delete_officer_violation(
    violation_id: int,
    user: dict = Depends(require_role(["officer"])),
    db: Session = Depends(get_db)
):
    v = db.query(Violation).filter(Violation.id == violation_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Violation notice not found")

    code = v.violation_code
    db.query(CorrectiveAction).filter(CorrectiveAction.violation_code == code).delete()
    db.delete(v)
    db.commit()

    log_audit(
        db=db,
        user=user,
        action="Violation Deleted",
        entity_type="violation",
        entity_id=code,
        details=f"Violation {code} was deleted/dismissed by Officer {user['name']}."
    )
    return {"success": True, "message": f"Violation {code} dismissed and deleted."}

@app.post("/api/manufacturer/products")
def create_manufacturer_product(
    req: ProductCreate,
    user: dict = Depends(require_role(["manufacturer"])),
    db: Session = Depends(get_db)
):
    company = user.get("company_name", "ABC Foods Pvt Ltd")
    existing_count = db.query(Product).filter(Product.manufacturer_name == company).count() + 1
    sku_prefix = "".join([w[0] for w in company.split() if w]).upper()[:3] or "SKU"
    product_code = f"{sku_prefix}-SKU-{existing_count:03d}"
    while db.query(Product).filter(Product.product_code == product_code).first():
        existing_count += 1
        product_code = f"{sku_prefix}-SKU-{existing_count:03d}"

    prod = Product(
        product_code=product_code,
        name=req.name,
        brand=req.brand or company,
        category=req.category or "Packaged Commodity",
        manufacturer_name=company,
        pack_size=req.pack_size or "100 g",
        mrp=req.mrp or 0.0,
        barcode=req.barcode or f"890{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')[-10:]}",
        compliance_status=req.compliance_status or "COMPLIANT",
        created_at=datetime.datetime.utcnow()
    )
    db.add(prod)
    db.commit()

    log_audit(
        db=db,
        user=user,
        action="Product Registered",
        entity_type="product",
        entity_id=product_code,
        details=f"Registered product {req.name} ({product_code}) in company catalog."
    )

    return {
        "success": True,
        "id": prod.id,
        "product_code": prod.product_code,
        "message": f"Product {prod.name} saved to catalog with SKU {prod.product_code}."
    }

@app.post("/api/products")
def create_product(
    req: ProductCreate,
    user: dict = Depends(require_role(["officer", "manufacturer"])),
    db: Session = Depends(get_db)
):
    count = db.query(Product).count() + 1
    product_code = f"PROD-{count:04d}"
    while db.query(Product).filter(Product.product_code == product_code).first():
        count += 1
        product_code = f"PROD-{count:04d}"

    prod = Product(
        product_code=product_code,
        name=req.name,
        brand=req.brand or "Standard",
        category=req.category or "Packaged Commodity",
        manufacturer_name=user.get("company_name") or req.brand or "General Packer",
        pack_size=req.pack_size or "100 g",
        mrp=req.mrp or 0.0,
        barcode=req.barcode or f"890{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')[-10:]}",
        compliance_status=req.compliance_status or "COMPLIANT",
        created_at=datetime.datetime.utcnow()
    )
    db.add(prod)
    db.commit()
    return {"success": True, "product_code": prod.product_code, "id": prod.id}

@app.delete("/api/products/{product_id}")
def delete_product(
    product_id: int,
    user: dict = Depends(require_role(["officer", "manufacturer"])),
    db: Session = Depends(get_db)
):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    code = p.product_code
    db.delete(p)
    db.commit()
    return {"success": True, "message": f"Product {code} deleted."}

@app.delete("/api/officer/complaints/{complaint_id}")
def delete_officer_complaint(
    complaint_id: int,
    user: dict = Depends(require_role(["officer"])),
    db: Session = Depends(get_db)
):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    code = c.complaint_code
    db.delete(c)
    db.commit()
    log_audit(
        db=db,
        user=user,
        action="Complaint Deleted",
        entity_type="complaint",
        entity_id=code,
        details=f"Complaint {code} deleted by Officer {user['name']}."
    )
    return {"success": True, "message": f"Complaint {code} deleted."}

@app.delete("/api/user/complaints/{complaint_id}")
def delete_user_complaint(
    complaint_id: int,
    user: dict = Depends(require_role(["user"])),
    db: Session = Depends(get_db)
):
    user_id = user.get("user_id") or user.get("id")
    c = db.query(Complaint).filter(Complaint.id == complaint_id, Complaint.consumer_id == user_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    code = c.complaint_code
    db.delete(c)
    db.commit()
    return {"success": True, "message": f"Complaint {code} withdrawn/deleted."}

@app.delete("/api/user/scans/{scan_id}")
def delete_user_scan(
    scan_id: int,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = user.get("user_id") or user.get("id")
    s = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scan record not found")
    if s.user_id and s.user_id != user_id and user.get("role") != "officer":
        raise HTTPException(status_code=403, detail="Not authorized to delete this scan record")
    db.delete(s)
    db.commit()
    return {"success": True, "message": "Scan record deleted successfully."}

@app.delete("/api/officer/inspections/{inspection_id}")
def delete_officer_inspection(
    inspection_id: int,
    user: dict = Depends(require_role(["officer"])),
    db: Session = Depends(get_db)
):
    ins = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Inspection not found")
    code = ins.inspection_code
    db.delete(ins)
    db.commit()
    return {"success": True, "message": f"Inspection {code} deleted."}

@app.delete("/api/officer/corrective-actions/{ca_id}")
@app.delete("/api/manufacturer/corrective-actions/{ca_id}")
@app.delete("/api/corrective-actions/{ca_id}")
def delete_corrective_action(
    ca_id: int,
    user: dict = Depends(require_role(["officer", "manufacturer"])),
    db: Session = Depends(get_db)
):
    ca = db.query(CorrectiveAction).filter(CorrectiveAction.id == ca_id).first()
    if not ca:
        raise HTTPException(status_code=404, detail="Corrective action not found")
    code = ca.ca_code
    db.delete(ca)
    db.commit()
    return {"success": True, "message": f"Corrective action {code} deleted."}

@app.delete("/api/officer/violations/{violation_id}")
@app.delete("/api/manufacturer/violations/{violation_id}")
@app.delete("/api/violations/{violation_id}")
def delete_violation(
    violation_id: int,
    user: dict = Depends(require_role(["officer", "manufacturer"])),
    db: Session = Depends(get_db)
):
    v = db.query(Violation).filter(Violation.id == violation_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Violation not found")
    code = v.violation_code
    # Also delete associated corrective actions
    db.query(CorrectiveAction).filter(CorrectiveAction.violation_id == v.id).delete(synchronize_session=False)
    db.delete(v)
    db.commit()
    return {"success": True, "message": f"Violation notice {code} deleted."}

@app.delete("/api/officer/products/{product_id}")
@app.delete("/api/manufacturer/products/{product_id}")
def delete_product_by_role(
    product_id: int,
    user: dict = Depends(require_role(["officer", "manufacturer"])),
    db: Session = Depends(get_db)
):
    return delete_product(product_id=product_id, user=user, db=db)

@app.delete("/api/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"success": True, "message": "Notification deleted."}

@app.delete("/api/notifications")
def clear_all_notifications(
    user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = user.get("user_id") or user.get("id")
    role = user.get("role")
    db.query(Notification).filter(
        (Notification.recipient_user_id == user_id) | (Notification.recipient_role == role)
    ).delete(synchronize_session=False)
    db.commit()
    return {"success": True, "message": "All notifications cleared."}

@app.post("/api/upload-evidence")
def upload_evidence_file(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    import time
    filename = f"remedy_{int(time.time())}_{file.filename.replace(' ', '_')}"
    filepath = os.path.join(OUTPUTS_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(file.file.read())
    return {
        "success": True,
        "url": f"/outputs/{filename}",
        "filename": filename
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

