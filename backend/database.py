import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from auth import hash_password

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "legal_metrology.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ----------------- MODELS -----------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'user', 'officer', 'manufacturer'
    company_name = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    category = Column(String, nullable=False)
    manufacturer_name = Column(String, nullable=False)
    pack_size = Column(String, nullable=False)
    mrp = Column(Float, nullable=False)
    barcode = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    compliance_status = Column(String, default="COMPLIANT") # COMPLIANT, POTENTIAL_NON_COMPLIANCE, REVIEW_REQUIRED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    inspection_code = Column(String, unique=True, index=True) # INS-2026-001
    product_name = Column(String, nullable=False)
    manufacturer_name = Column(String, nullable=False)
    officer_id = Column(Integer, nullable=True)
    officer_name = Column(String, nullable=True)
    inspection_type = Column(String, default="physical_package") # physical_package, ecommerce_listing
    compliance_status = Column(String, default="COMPLIANT")
    violations_count = Column(Integer, default=0)
    raw_ocr_json = Column(Text, nullable=True)
    declarations_json = Column(Text, nullable=True)
    evidence_image_url = Column(String, nullable=True)
    officer_remarks = Column(Text, nullable=True)
    status = Column(String, default="Completed") # Under Review, Completed, Escalated
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_code = Column(String, unique=True, index=True) # LM-CMP-2026-0001
    consumer_id = Column(Integer, nullable=False)
    consumer_name = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    manufacturer_name = Column(String, nullable=True)
    issue_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="SUBMITTED") # SUBMITTED, UNDER_REVIEW, VERIFIED, VIOLATION_CREATED, RESOLVED, REJECTED, CLOSED
    evidence_image_url = Column(String, nullable=True)
    additional_evidence_json = Column(Text, nullable=True)
    ocr_scan_id = Column(Integer, nullable=True)
    detected_declarations_json = Column(Text, nullable=True)
    compliance_status = Column(String, nullable=True)
    rule_id = Column(String, nullable=True)
    violation_id = Column(Integer, nullable=True)
    violation_code = Column(String, nullable=True)
    assigned_officer = Column(String, nullable=True)
    officer_remarks = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    violation_code = Column(String, unique=True, index=True) # LM-VIO-2026-0001
    complaint_id = Column(Integer, nullable=True)
    complaint_code = Column(String, nullable=True)
    product_id = Column(Integer, nullable=True)
    product_name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    manufacturer_name = Column(String, nullable=False)
    rule_id = Column(String, nullable=False) # LM-01 through LM-11
    rule_name = Column(String, nullable=False)
    severity = Column(String, default="Medium") # Low, Medium, High, Critical
    status = Column(String, default="OPEN") # OPEN, UNDER_REVIEW, RESOLVED, ESCALATED
    reason = Column(Text, nullable=False)
    extracted_value = Column(String, nullable=True)
    ocr_text = Column(String, nullable=True)
    evidence_image_url = Column(String, nullable=True)
    annotated_image_url = Column(String, nullable=True)
    officer_public_finding = Column(Text, nullable=True)
    officer_notes = Column(Text, nullable=True)
    escalation_reason = Column(Text, nullable=True)
    officer_id = Column(Integer, nullable=True)
    officer_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"

    id = Column(Integer, primary_key=True, index=True)
    ca_code = Column(String, unique=True, index=True) # LM-CA-2026-0001
    violation_id = Column(Integer, nullable=True)
    violation_code = Column(String, nullable=False)
    complaint_id = Column(Integer, nullable=True)
    complaint_code = Column(String, nullable=True)
    manufacturer_id = Column(Integer, nullable=True)
    manufacturer_name = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    what_was_changed = Column(Text, nullable=True)
    proposed_resolution = Column(Text, nullable=True)
    explanation = Column(Text, nullable=False)
    corrected_image_url = Column(String, nullable=True)
    supporting_docs_url = Column(String, nullable=True)
    manufacturer_comments = Column(Text, nullable=True)
    status = Column(String, default="PENDING_OFFICER_REVIEW") # DRAFT, SUBMITTED, PENDING_OFFICER_REVIEW, REVISION_REQUIRED, APPROVED, DENIED
    officer_review_decision = Column(String, nullable=True) # APPROVE, DENY, REQUEST_REVISION, ESCALATE
    officer_review_notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_user_id = Column(Integer, nullable=True) # If null, broadcast to recipient_role
    recipient_role = Column(String, nullable=True) # 'user', 'officer', 'manufacturer'
    type = Column(String, nullable=False) # NEW_COMPLAINT, COMPLAINT_VERIFIED, VIOLATION_CREATED, etc.
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    entity_type = Column(String, nullable=True) # 'complaint', 'violation', 'corrective_action'
    entity_id = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    action_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_name = Column(String, nullable=False)
    user_role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False) # 'complaint', 'violation', 'corrective_action'
    entity_id = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_role = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    annotated_image_url = Column(String, nullable=True)
    compliance_status = Column(String, default="COMPLIANT")
    total_detections = Column(Integer, default=0)
    violations_count = Column(Integer, default=0)
    processing_time_seconds = Column(Float, default=0.0)
    raw_ocr_json = Column(Text, nullable=True)
    declarations_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ----------------- DB INIT & SEEDING -----------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_and_seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed essential authentication users if not already present
        if db.query(User).count() == 0:
            demo_users = [
                User(
                    email="user@demo.com",
                    hashed_password=hash_password("User@123"),
                    name="Rahul Sharma",
                    role="user",
                    company_name=None,
                    designation="Consumer"
                ),
                User(
                    email="officer@lm.gov.in",
                    hashed_password=hash_password("Officer@123"),
                    name="Vikram Sethi",
                    role="officer",
                    company_name="Department of Consumer Affairs, Legal Metrology",
                    designation="Senior Metrology Inspector"
                ),
                User(
                    email="manufacturer@abcfoods.com",
                    hashed_password=hash_password("Manufacturer@123"),
                    name="Rajesh Gupta",
                    role="manufacturer",
                    company_name="ABC Foods Pvt Ltd",
                    designation="Compliance Manager"
                ),
            ]
            db.add_all(demo_users)
            db.commit()
    finally:
        db.close()

def clear_all_demo_data():
    """Wipes all transactional, operational, and sample records while preserving user accounts."""
    db = SessionLocal()
    try:
        db.query(Complaint).delete()
        db.query(Violation).delete()
        db.query(CorrectiveAction).delete()
        db.query(Product).delete()
        db.query(Inspection).delete()
        db.query(Notification).delete()
        db.query(AuditLog).delete()
        db.query(ScanRecord).delete()
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    init_and_seed_db()
    print("Database initialized (clean mode, 0 demo records).")
