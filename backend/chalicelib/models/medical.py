from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship
from chalicelib.models.base import SoftDeleteMixin, _uuid

if TYPE_CHECKING:
    from chalicelib.models.pet import Pet


class MedicalVisit(SoftDeleteMixin, table=True):
    """Pet 삭제 시 CASCADE 삭제. 진료 이력은 Soft Delete 우선."""
    __tablename__ = "medical_visits"

    id: str = Field(default_factory=_uuid, primary_key=True)
    pet_id: str = Field(foreign_key="pets.id", nullable=False, index=True)
    visit_date: str = Field(nullable=False)   # YYYY-MM-DD
    hospital_name: str = Field(nullable=False)
    vet_name: Optional[str] = Field(default=None)
    visit_type: str = Field(nullable=False)   # CHECK_UP | TREATMENT | SURGERY | EMERGENCY
    chief_complaint: str = Field(nullable=False)
    diagnosis: str = Field(nullable=False)
    treatment_notes: Optional[str] = Field(default=None)
    follow_up_date: Optional[str] = Field(default=None)
    cost: Optional[int] = Field(default=None)

    pet: Optional["Pet"] = Relationship(back_populates="medical_visits")
    prescriptions: list["Prescription"] = Relationship(
        back_populates="medical_visit",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class Prescription(SoftDeleteMixin, table=True):
    """Pet 삭제 시 CASCADE. MedicalVisit 삭제 시도 CASCADE (nullable FK이므로 SET NULL 불가 → CASCADE)."""
    __tablename__ = "prescriptions"

    id: str = Field(default_factory=_uuid, primary_key=True)
    pet_id: str = Field(foreign_key="pets.id", nullable=False, index=True)
    medical_visit_id: Optional[str] = Field(
        foreign_key="medical_visits.id", default=None, index=True
    )
    prescribed_date: str = Field(nullable=False)
    hospital_name: str = Field(nullable=False)
    vet_name: Optional[str] = Field(default=None)
    drug_name: str = Field(nullable=False)
    dosage: str = Field(nullable=False)
    frequency: str = Field(nullable=False)
    duration_days: int = Field(nullable=False)
    purpose: Optional[str] = Field(default=None)
    notes: Optional[str] = Field(default=None)

    pet: Optional["Pet"] = Relationship(back_populates="prescriptions")
    medical_visit: Optional["MedicalVisit"] = Relationship(back_populates="prescriptions")


class Vaccination(SoftDeleteMixin, table=True):
    """Pet 삭제 시 CASCADE 삭제."""
    __tablename__ = "vaccinations"

    id: str = Field(default_factory=_uuid, primary_key=True)
    pet_id: str = Field(foreign_key="pets.id", nullable=False, index=True)
    vaccine_name: str = Field(nullable=False)
    vaccination_type: str = Field(nullable=False)  # CORE | NON_CORE | RABIES
    vaccinated_date: str = Field(nullable=False)
    next_due_date: Optional[str] = Field(default=None, index=True)
    hospital_name: str = Field(nullable=False)
    vet_name: Optional[str] = Field(default=None)
    batch_number: Optional[str] = Field(default=None)
    manufacturer: Optional[str] = Field(default=None)

    pet: Optional["Pet"] = Relationship(back_populates="vaccinations")
