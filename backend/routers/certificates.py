import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/certificates", tags=["certificates"])

@router.post("")
def create_certificate(cert: schemas.CertificateCreate, db: Session = Depends(get_db)):
    cert_id = str(uuid.uuid4())
    new_cert = models.Certificate(
        id=cert_id,
        user_id=0, # Anonymous or link to user if we extract token
        question=cert.question,
        final_answer=cert.final_answer,
        confidence_score=cert.confidence_score,
        trust_explanation=cert.trust_explanation,
        created_at=datetime.now(timezone.utc).isoformat()
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    return {"certificate_id": cert_id}

@router.get("/{cert_id}")
def get_certificate(cert_id: str, db: Session = Depends(get_db)):
    db_cert = db.query(models.Certificate).filter(models.Certificate.id == cert_id).first()
    if not db_cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return db_cert
