from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Asset, AssetStatus, Ticket, TicketEvent, TicketStatus
from ..schemas import TicketCreate, TicketOut, TicketStatusUpdate

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("", response_model=TicketOut)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == payload.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    ticket = Ticket(**payload.model_dump())
    asset.status = AssetStatus.FAULTY

    db.add(ticket)
    db.flush()
    db.add(TicketEvent(ticket_id=ticket.id, event_type="created", details="Ticket opened"))
    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/status", response_model=TicketOut)
def update_ticket_status(ticket_id: str, payload: TicketStatusUpdate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = payload.status
    if payload.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
        ticket.closed_at = datetime.utcnow()

    db.add(TicketEvent(ticket_id=ticket.id, event_type="status_changed", details=payload.details or payload.status.value))
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("", response_model=list[TicketOut])
def list_tickets(db: Session = Depends(get_db)):
    return db.query(Ticket).order_by(Ticket.opened_at.desc()).all()
