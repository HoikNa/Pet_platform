# 모든 모델을 한 곳에서 import — Alembic autogenerate가 감지할 수 있도록
from chalicelib.models.user import User
from chalicelib.models.pet import Pet
from chalicelib.models.biometric import BiometricIdentity
from chalicelib.models.rfid import RFIDToken
from chalicelib.models.scan import HealthScan
from chalicelib.models.medical import MedicalVisit, Prescription, Vaccination
from chalicelib.models.organization import Organization, Membership

__all__ = [
    "User", "Pet", "BiometricIdentity", "RFIDToken",
    "HealthScan", "MedicalVisit", "Prescription", "Vaccination",
    "Organization", "Membership",
]
