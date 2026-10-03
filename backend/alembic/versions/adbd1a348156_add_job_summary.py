"""add job summary

Revision ID: adbd1a348156
Revises: 0fe83d2d9b42
Create Date: 2026-09-08 20:28:42.780821

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "adbd1a348156"
down_revision: Union[str, Sequence[str], None] = "0fe83d2d9b42"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "jobs",
        sa.Column(
            "summary",
            sa.Text(),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("jobs", "summary")