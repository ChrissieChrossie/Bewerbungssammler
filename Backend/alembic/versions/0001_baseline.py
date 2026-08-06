"""Baseline: Schema, wie es vor Einführung von Alembic per create_all() existierte.

Für Datenbanken, die bereits vor Alembic angelegt wurden, wird diese Revision
per ``alembic stamp`` übersprungen (siehe database.run_migrations()) -- die
Tabellen existieren dort schon. Für neue, leere Datenbanken legt sie das
komplette Ausgangs-Schema an.

Revision ID: 0001_baseline
Revises:
Create Date: 2026-08-03
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_baseline"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "companies",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("homepage", sa.String(length=500), nullable=True),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=False, unique=True),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "job_postings",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("posted_at", sa.Date(), nullable=True),
        sa.Column("link", sa.String(length=500), nullable=True),
        sa.Column("company_id", sa.Integer(), sa.ForeignKey("companies.id"), nullable=False),
    )

    op.create_table(
        "applications",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "job_posting_id", sa.Integer(), sa.ForeignKey("job_postings.id"), nullable=False
        ),
        sa.Column(
            "status",
            sa.Enum(
                "open", "in_progress", "invited", "rejected", "accepted",
                name="applicationstatus",
            ),
            nullable=False,
        ),
        sa.Column("applied_at", sa.Date(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("applications")
    op.drop_table("job_postings")
    op.drop_index("ix_users_username", table_name="users")
    op.drop_table("users")
    op.drop_table("companies")
    sa.Enum(name="applicationstatus").drop(op.get_bind(), checkfirst=True)
