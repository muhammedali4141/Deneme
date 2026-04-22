from datetime import date, datetime
from enum import Enum
from sqlalchemy import Date, DateTime, Enum as SQLEnum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from .db import Base


class AssetStatus(str, Enum):
    IN_STOCK = "in_stock"
    ASSIGNED = "assigned"
    FAULTY = "faulty"
    IN_SERVICE = "in_service"
    SCRAPPED = "scrapped"


class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    IN_SERVICE = "in_service"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    role: Mapped[str] = mapped_column(String(40), nullable=False, default="viewer")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category: Mapped[str] = mapped_column(String(60), nullable=False)
    brand: Mapped[str] = mapped_column(String(80), nullable=False)
    model: Mapped[str] = mapped_column(String(120), nullable=False)
    serial_number: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    location: Mapped[str] = mapped_column(String(120), nullable=False, default="main_warehouse")
    status: Mapped[AssetStatus] = mapped_column(SQLEnum(AssetStatus), nullable=False, default=AssetStatus.IN_STOCK)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    assigned_date: Mapped[date] = mapped_column(Date, nullable=False)
    returned_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    delivered_by: Mapped[str] = mapped_column(String(120), nullable=False)
    received_by: Mapped[str] = mapped_column(String(120), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    asset: Mapped[Asset] = relationship()
    user: Mapped[User] = relationship()


class Ticket(Base):
    __tablename__ = "tickets"
    __table_args__ = (UniqueConstraint("ticket_no", name="uq_ticket_no"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_no: Mapped[str] = mapped_column(String(40), nullable=False)
    asset_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    opened_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    status: Mapped[TicketStatus] = mapped_column(SQLEnum(TicketStatus), nullable=False, default=TicketStatus.OPEN)
    priority: Mapped[TicketPriority] = mapped_column(SQLEnum(TicketPriority), nullable=False, default=TicketPriority.MEDIUM)
    issue_description: Mapped[str] = mapped_column(Text, nullable=False)
    resolution_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    asset: Mapped[Asset] = relationship()
    events: Mapped[list["TicketEvent"]] = relationship(back_populates="ticket", cascade="all, delete-orphan")


class TicketEvent(Base):
    __tablename__ = "ticket_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tickets.id"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(80), nullable=False)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    ticket: Mapped[Ticket] = relationship(back_populates="events")
