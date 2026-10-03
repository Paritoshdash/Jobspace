import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password
from app.db.session import SessionLocal, get_db
from app.main import app
from app.models.job import Job
from app.models.user import User


@pytest.fixture(scope="session")
def db_session():
    """Provides a database session for test teardown / cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def client():
    """FastAPI TestClient instance."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="module")
def test_user(db_session: Session):
    """Ensures a standard test user exists."""
    user = db_session.query(User).filter(User.email == "test_developer@jobspace.ai").first()
    if not user:
        user = User(
            email="test_developer@jobspace.ai",
            password_hash=hash_password("Password123!"),
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return user


@pytest.fixture(scope="module")
def auth_headers(test_user: User):
    """Generates valid Bearer authentication headers."""
    token = create_access_token(str(test_user.id))
    return {"Authorization": f"Bearer {token}"}
