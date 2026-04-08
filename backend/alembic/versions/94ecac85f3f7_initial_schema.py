"""initial_schema — 전체 테이블 생성

Revision ID: 94ecac85f3f7
Revises:
Create Date: 2026-04-08

NOTE: DB 연결 후 아래 명령으로 자동 diff 기반 재생성 가능:
    alembic revision --autogenerate -m "initial_schema"
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "94ecac85f3f7"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=True),
        sa.Column("social_key", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_social_key", "users", ["social_key"], unique=True)

    # ── organizations ──────────────────────────────────────────
    op.create_table(
        "organizations",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("org_type", sa.String(), nullable=False),
        sa.Column("contact", sa.String(), nullable=True),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # ── memberships ────────────────────────────────────────────
    op.create_table(
        "memberships",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("org_id", sa.String(), sa.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(), nullable=False, server_default="MEMBER"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_memberships_org_id", "memberships", ["org_id"])
    op.create_index("ix_memberships_user_id", "memberships", ["user_id"])

    # ── pets ───────────────────────────────────────────────────
    op.create_table(
        "pets",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("owner_id", sa.String(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("species", sa.String(), nullable=False),
        sa.Column("breed", sa.String(), nullable=False),
        sa.Column("birth_date", sa.String(), nullable=False),
        sa.Column("gender", sa.String(), nullable=False),
        sa.Column("is_neutered", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("registration_status", sa.String(), nullable=False, server_default="PENDING"),
        sa.Column("weight", sa.Float(), nullable=True),
        sa.Column("profile_image_url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_pets_owner_id", "pets", ["owner_id"])

    # ── biometric_identities ───────────────────────────────────
    op.create_table(
        "biometric_identities",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("pet_id", sa.String(), sa.ForeignKey("pets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scan_source_url", sa.String(), nullable=False),
        sa.Column("feature_vector", sa.Text(), nullable=True),
        sa.Column("quality_score", sa.Float(), nullable=False),
        sa.Column("certified_by", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_biometric_identities_pet_id", "biometric_identities", ["pet_id"], unique=True)

    # ── rfid_tokens ────────────────────────────────────────────
    op.create_table(
        "rfid_tokens",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("pet_id", sa.String(), sa.ForeignKey("pets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("serial", sa.String(), nullable=False),
        sa.Column("issued_at", sa.String(), nullable=False),
        sa.Column("expires_at", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="ACTIVE"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_rfid_tokens_pet_id", "rfid_tokens", ["pet_id"])
    op.create_index("ix_rfid_tokens_serial", "rfid_tokens", ["serial"], unique=True)

    # ── health_scans ───────────────────────────────────────────
    op.create_table(
        "health_scans",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("pet_id", sa.String(), sa.ForeignKey("pets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scan_date", sa.String(), nullable=False),
        sa.Column("bcs_score", sa.Integer(), nullable=True),
        sa.Column("gait_score", sa.Float(), nullable=True),
        sa.Column("eye_clarity_score", sa.Float(), nullable=True),
        sa.Column("voice_emotion_score", sa.Float(), nullable=True),
        sa.Column("ai_comment", sa.Text(), nullable=True),
        sa.Column("attachment_urls", sa.Text(), nullable=True),
        sa.Column("scan_types", sa.String(), nullable=True),
        sa.Column("job_status", sa.String(), nullable=False, server_default="PENDING"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_health_scans_pet_id", "health_scans", ["pet_id"])
    op.create_index("ix_health_scans_scan_date", "health_scans", ["scan_date"])

    # ── medical_visits ─────────────────────────────────────────
    op.create_table(
        "medical_visits",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("pet_id", sa.String(), sa.ForeignKey("pets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("visit_date", sa.String(), nullable=False),
        sa.Column("hospital_name", sa.String(), nullable=False),
        sa.Column("vet_name", sa.String(), nullable=True),
        sa.Column("visit_type", sa.String(), nullable=False),
        sa.Column("chief_complaint", sa.String(), nullable=False),
        sa.Column("diagnosis", sa.String(), nullable=False),
        sa.Column("treatment_notes", sa.Text(), nullable=True),
        sa.Column("follow_up_date", sa.String(), nullable=True),
        sa.Column("cost", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_medical_visits_pet_id", "medical_visits", ["pet_id"])

    # ── prescriptions ──────────────────────────────────────────
    op.create_table(
        "prescriptions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("pet_id", sa.String(), sa.ForeignKey("pets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("medical_visit_id", sa.String(), sa.ForeignKey("medical_visits.id", ondelete="SET NULL"), nullable=True),
        sa.Column("prescribed_date", sa.String(), nullable=False),
        sa.Column("hospital_name", sa.String(), nullable=False),
        sa.Column("vet_name", sa.String(), nullable=True),
        sa.Column("drug_name", sa.String(), nullable=False),
        sa.Column("dosage", sa.String(), nullable=False),
        sa.Column("frequency", sa.String(), nullable=False),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("purpose", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_prescriptions_pet_id", "prescriptions", ["pet_id"])
    op.create_index("ix_prescriptions_medical_visit_id", "prescriptions", ["medical_visit_id"])

    # ── vaccinations ───────────────────────────────────────────
    op.create_table(
        "vaccinations",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("pet_id", sa.String(), sa.ForeignKey("pets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("vaccine_name", sa.String(), nullable=False),
        sa.Column("vaccination_type", sa.String(), nullable=False),
        sa.Column("vaccinated_date", sa.String(), nullable=False),
        sa.Column("next_due_date", sa.String(), nullable=True),
        sa.Column("hospital_name", sa.String(), nullable=False),
        sa.Column("vet_name", sa.String(), nullable=True),
        sa.Column("batch_number", sa.String(), nullable=True),
        sa.Column("manufacturer", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_vaccinations_pet_id", "vaccinations", ["pet_id"])
    op.create_index("ix_vaccinations_next_due_date", "vaccinations", ["next_due_date"])

    # ── Partial Indexes: Active 레코드 조회 최적화 (PostgreSQL) ──
    op.execute("CREATE INDEX ix_users_active ON users (id) WHERE is_deleted = false")
    op.execute("CREATE INDEX ix_pets_active ON pets (owner_id) WHERE is_deleted = false")
    op.execute("CREATE INDEX ix_medical_visits_active ON medical_visits (pet_id) WHERE is_deleted = false")
    op.execute("CREATE INDEX ix_prescriptions_active ON prescriptions (pet_id) WHERE is_deleted = false")
    op.execute("CREATE INDEX ix_vaccinations_active ON vaccinations (pet_id) WHERE is_deleted = false")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_vaccinations_active")
    op.execute("DROP INDEX IF EXISTS ix_prescriptions_active")
    op.execute("DROP INDEX IF EXISTS ix_medical_visits_active")
    op.execute("DROP INDEX IF EXISTS ix_pets_active")
    op.execute("DROP INDEX IF EXISTS ix_users_active")

    op.drop_table("vaccinations")
    op.drop_table("prescriptions")
    op.drop_table("medical_visits")
    op.drop_table("health_scans")
    op.drop_table("rfid_tokens")
    op.drop_table("biometric_identities")
    op.drop_table("pets")
    op.drop_table("memberships")
    op.drop_table("organizations")
    op.drop_table("users")
