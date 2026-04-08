from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship
from chalicelib.models.base import SoftDeleteMixin, _uuid

if TYPE_CHECKING:
    from chalicelib.models.user import User
    from chalicelib.models.biometric import BiometricIdentity
    from chalicelib.models.rfid import RFIDToken
    from chalicelib.models.scan import HealthScan
    from chalicelib.models.medical import MedicalVisit, Prescription, Vaccination


class Pet(SoftDeleteMixin, table=True):
    __tablename__ = "pets"

    id: str = Field(default_factory=_uuid, primary_key=True)
    owner_id: str = Field(foreign_key="users.id", nullable=False, index=True)
    name: str = Field(nullable=False)
    species: str = Field(nullable=False)        # DOG | CAT | OTHER
    breed: str = Field(nullable=False)
    birth_date: str = Field(nullable=False)     # YYYY-MM-DD
    gender: str = Field(nullable=False)         # MALE | FEMALE
    is_neutered: bool = Field(default=False)
    registration_status: str = Field(default="PENDING")  # PENDING | VERIFIED
    weight: Optional[float] = Field(default=None)
    profile_image_url: Optional[str] = Field(default=None)

    # Relations — CASCADE: 펫 삭제 시 하위 데이터 함께 삭제
    owner: Optional["User"] = Relationship(back_populates="pets")
    biometric: Optional["BiometricIdentity"] = Relationship(
        back_populates="pet",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "uselist": False},
    )
    rfid_tokens: list["RFIDToken"] = Relationship(
        back_populates="pet",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    health_scans: list["HealthScan"] = Relationship(
        back_populates="pet",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    medical_visits: list["MedicalVisit"] = Relationship(
        back_populates="pet",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    prescriptions: list["Prescription"] = Relationship(
        back_populates="pet",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    vaccinations: list["Vaccination"] = Relationship(
        back_populates="pet",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
