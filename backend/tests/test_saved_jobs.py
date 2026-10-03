from fastapi.testclient import TestClient


def test_saved_job_lifecycle(client: TestClient, auth_headers: dict):
    # 1. Fetch an existing job or create one
    jobs_res = client.get("/api/v1/jobs?limit=1")
    assert jobs_res.status_code == 200
    jobs = jobs_res.json()
    assert len(jobs) > 0
    job_id = jobs[0]["id"]

    # 2. Check initial saved status
    status_res = client.get(f"/api/v1/saved-jobs/{job_id}/status", headers=auth_headers)
    assert status_res.status_code == 200
    # If previously saved in another run, unsave it first
    if status_res.json()["is_saved"]:
        client.delete(f"/api/v1/saved-jobs/{job_id}", headers=auth_headers)

    # 3. Save the job
    save_res = client.post(f"/api/v1/saved-jobs/{job_id}", headers=auth_headers)
    assert save_res.status_code == 201
    saved_data = save_res.json()
    assert saved_data["job_id"] == job_id
    assert "job" in saved_data

    # 4. Check status is now True
    status_res2 = client.get(f"/api/v1/saved-jobs/{job_id}/status", headers=auth_headers)
    assert status_res2.status_code == 200
    assert status_res2.json()["is_saved"] is True

    # 5. List saved jobs
    list_res = client.get("/api/v1/saved-jobs", headers=auth_headers)
    assert list_res.status_code == 200
    saved_list = list_res.json()
    saved_ids = [item["job_id"] for item in saved_list]
    assert job_id in saved_ids

    # 6. Idempotent re-save
    save_res2 = client.post(f"/api/v1/saved-jobs/{job_id}", headers=auth_headers)
    assert save_res2.status_code == 201
    assert save_res2.json()["job_id"] == job_id

    # 7. Unsave job
    del_res = client.delete(f"/api/v1/saved-jobs/{job_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # 8. Verify status is False
    status_res3 = client.get(f"/api/v1/saved-jobs/{job_id}/status", headers=auth_headers)
    assert status_res3.status_code == 200
    assert status_res3.json()["is_saved"] is False


def test_saved_job_unauthorized(client: TestClient):
    res = client.get("/api/v1/saved-jobs")
    assert res.status_code in [401, 403]
