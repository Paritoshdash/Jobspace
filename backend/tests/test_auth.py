import uuid
from fastapi.testclient import TestClient


def test_register_and_login_flow(client: TestClient):
    unique_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    # 1. Register new user
    res_reg = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password},
    )
    assert res_reg.status_code == 201
    data = res_reg.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # 2. Duplicate registration should return 409 Conflict
    res_dup = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password},
    )
    assert res_dup.status_code == 409

    # 3. Login with valid credentials
    res_login = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": password},
    )
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]

    # 4. Verify /users/me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/v1/users/me", headers=headers)
    assert res_me.status_code == 200
    user_info = res_me.json()
    assert user_info["email"] == unique_email
    assert user_info["is_active"] is True


def test_login_invalid_password(client: TestClient):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "WrongPassword!"},
    )
    assert res.status_code == 401


def test_unauthenticated_access_rejected(client: TestClient):
    res = client.get("/api/v1/users/me")
    assert res.status_code == 401 or res.status_code == 403
