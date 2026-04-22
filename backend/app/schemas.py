from datetime import date, datetime
from pydantic import BaseModel, Field, EmailStr
from uuid import UUID

from .models import AssetStatus, TicketPriority, TicketStatus


class UserCreate(BaseModel):
    full_name: str = Field(min_length=3, max_length=120)
    email: EmailStr
    role: str = Field(default="viewer")


class UserOut(UserCreate):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class AssetCreate(BaseModel):
    category: str
    brand: str
    model: str
    serial_number: str
    location: str = "main_warehouse"


class AssetOut(AssetCreate):
    id: UUID
    status: AssetStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AssignmentCreate(BaseModel):
    asset_id: UUID
    user_id: UUID
    assigned_date: date
    delivered_by: str
    received_by: str
    notes: str | None = None


class AssignmentReturn(BaseModel):
    returned_date: date


class AssignmentOut(BaseModel):
    id: UUID
    asset_id: UUID
    user_id: UUID
    assigned_date: date
    returned_date: date | None
    delivered_by: str
    received_by: str
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class TicketCreate(BaseModel):
    ticket_no: str
    asset_id: UUID
    priority: TicketPriority = TicketPriority.MEDIUM
    issue_description: str


class TicketStatusUpdate(BaseModel):
    status: TicketStatus
    details: str | None = None


class TicketOut(BaseModel):
    id: UUID
    ticket_no: str
    asset_id: UUID
    opened_at: datetime
    status: TicketStatus
    priority: TicketPriority
    issue_description: str
    resolution_note: str | None
    closed_at: datetime | None

    class Config:
        from_attributes = True
