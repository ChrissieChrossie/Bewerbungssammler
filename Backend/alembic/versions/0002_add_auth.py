"""Auth-Attribute für users + refresh_tokens-Tabelle.

Fügt password_hash, created_at, updated_at, last_login_at zu users hinzu und
legt die refresh_tokens-Tabelle an.

Bestehende User-Datensätze (die es vor dieser Migration schon gab, z.B. per
create_all angelegte Test-User) bekommen einen fixen, unbrauchbaren
Platzhalter-Hash als password_hash (bcrypt-Hash eines zufälligen, niemandem
bekannten Werts -- ein Login damit ist unmöglich). Ihr Passwort muss danach
manuell in der DB zurückgesetzt werden (siehe README, Abschnitt
"Aktuelle Einschränkungen"). Neue Registrierungen setzen password_hash immer
explizit, daher wird der DB-seitige Default danach wieder entfernt.

Revision ID: 0002_add_auth
Revises: 0001_baseline
Create Date: 2026-08-03
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002_add_auth"
down_revision: Union[str, None] = "0001_baseline"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# bcrypt-Hash (cost 12) eines zufälligen, nirgendwo notierten Werts -- passt zu keinem
# echten Passwort. Nur für den Übergang bereits bestehender User-Datensätze.
_PLACEHOLDER_PASSWORD_HASH = "$2b$12$YOnRNNeujdI2qIq7wn5Td.SuwI5PQsgA5LGvfhChw63FpgjtPADO."


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(
            sa.Column(
                "password_hash",
                sa.String(length=255),
                nullable=False,
                server_default=_PLACEHOLDER_PASSWORD_HASH,
            )
        )
        batch_op.add_column(
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            )
        )
        batch_op.add_column(
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            )
        )
        batch_op.add_column(sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True))

    # Placeholder-Default wieder entfernen: neue Inserts müssen password_hash immer
    # explizit mitgeben (die App tut das immer -- ein fehlender Wert soll knallen,
    # nicht still den Platzhalter-Hash verwenden).
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("password_hash", server_default=None)

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
        ),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "remember_me", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )
    op.create_index(
        "ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"], unique=True
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_refresh_tokens_user_id", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_token_hash", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")

    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("last_login_at")
        batch_op.drop_column("updated_at")
        batch_op.drop_column("created_at")
        batch_op.drop_column("password_hash")
