from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Assignment, Asset, AssetStatus
from ..schemas import AssignmentCreate, AssignmentOut, AssignmentReturn

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.post("", response_model=AssignmentOut)
def create_assignment(payload: AssignmentCreate, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == payload.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset.status not in [AssetStatus.IN_STOCK]:
        raise HTTPException(status_code=400, detail="Asset is not available for assignment")

    assignment = Assignment(**payload.model_dump())
    asset.status = AssetStatus.ASSIGNED

    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.post("/{assignment_id}/return", response_model=AssignmentOut)
def return_assignment(assignment_id: str, payload: AssignmentReturn, db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if assignment.returned_date:
        raise HTTPException(status_code=409, detail="Assignment already closed")

    assignment.returned_date = payload.returned_date
    asset = db.query(Asset).filter(Asset.id == assignment.asset_id).first()
    if asset:
        asset.status = AssetStatus.IN_STOCK

    db.commit()
    db.refresh(assignment)
    return assignment


@router.get("", response_model=list[AssignmentOut])
def list_assignments(db: Session = Depends(get_db)):
    return db.query(Assignment).order_by(Assignment.created_at.desc()).all()
