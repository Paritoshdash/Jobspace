import uuid
from fastapi.testclient import TestClient


def test_application_lifecycle(client: TestClient, auth_headers: dict):
    # 1. Create a fresh job to apply for
    job_res = client.post(
        "/api/v1/jobs",
        json={
            "title": f"Staff Software Engineer {uuid.uuid4().hex[:6]}",
            "company": "AppCorp",
            "description": "Building scalable distributed services.",
            "source": "test",
        },
    )
    job_id = job_res.json()["id"]

    # 2. Create application
    apply_payload = {
        "job_id": job_id,
        "status": "applied",
    }
    apply_res = client.post("/api/v1/applications", json=apply_payload, headers=auth_headers)
    assert apply_res.status_code == 201
    app_data = apply_res.json()
    app_id = app_data["id"]
    assert app_data["job_id"] == job_id
    assert app_data["status"] == "applied"
    assert "job" in app_data

    # 3. List applications
    list_res = client.get("/api/v1/applications", headers=auth_headers)
    assert list_res.status_code == 200
    apps = list_res.json()
    assert any(a["id"] == app_id for a in apps)

    # 4. Get application by ID
    get_res = client.get(f"/api/v1/applications/{app_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == app_id

    # 5. Update application status
    patch_res = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "interviewing"},
        headers=auth_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "interviewing"

    # 6. Delete application
    del_res = client.delete(f"/api/v1/applications/{app_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # 7. Verify deletion
    get_after_del = client.get(f"/api/v1/applications/{app_id}", headers=auth_headers)
    assert get_after_del.status_code == 404


def test_application_unauthorized(client: TestClient):
    res = client.get("/api/v1/applications")
    assert res.status_code in [401, 403]
