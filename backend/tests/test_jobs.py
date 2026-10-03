import uuid
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "jobspace-api"


def test_list_jobs(client: TestClient):
    res = client.get("/api/v1/jobs?limit=5")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    if data:
        job = data[0]
        assert "id" in job
        assert "title" in job
        assert "company" in job
        assert "description" in job
        assert "skills" in job


def test_job_facets(client: TestClient):
    res = client.get("/api/v1/jobs/facets")
    assert res.status_code == 200
    facets = res.json()
    assert "locations" in facets
    assert "companies" in facets
    assert "experience_levels" in facets
    assert "employment_types" in facets
    assert "total_jobs" in facets
    assert facets["total_jobs"] >= 0


def test_create_and_get_job(client: TestClient):
    unique_title = f"Staff Backend Engineer {uuid.uuid4().hex[:6]}"
    payload = {
        "title": unique_title,
        "company": "JobSpace Core",
        "description": "Building next-generation job search backend using Python, FastAPI and PostgreSQL.",
        "location": "Remote",
        "employment_type": "Full-time",
        "experience_level": "senior",
        "salary_min": 140000,
        "salary_max": 200000,
        "source": "manual",
        "source_url": f"https://example.com/jobs/{uuid.uuid4().hex[:8]}",
    }
    create_res = client.post("/api/v1/jobs", json=payload)
    assert create_res.status_code == 201
    created_job = create_res.json()
    job_id = created_job["id"]
    assert created_job["title"] == unique_title
    assert created_job["company"] == "JobSpace Core"

    # Get job by ID
    get_res = client.get(f"/api/v1/jobs/{job_id}")
    assert get_res.status_code == 200
    fetched_job = get_res.json()
    assert fetched_job["id"] == job_id
    assert fetched_job["title"] == unique_title


def test_add_and_get_job_skills(client: TestClient):
    # Create job
    create_res = client.post(
        "/api/v1/jobs",
        json={
            "title": f"DevOps Lead {uuid.uuid4().hex[:6]}",
            "company": "Cloud Corp",
            "description": "Manage Kubernetes clusters, Terraform and Docker pipelines.",
            "source": "test",
        },
    )
    job_id = create_res.json()["id"]

    # Add skills
    skills_payload = {
        "skills": [
            {"name": "Kubernetes", "skill_type": "required"},
            {"name": "Terraform", "skill_type": "preferred"},
        ]
    }
    add_res = client.post(f"/api/v1/jobs/{job_id}/skills", json=skills_payload)
    assert add_res.status_code == 201
    added_skills = add_res.json()
    assert len(added_skills) == 2

    # Get skills
    get_skills_res = client.get(f"/api/v1/jobs/{job_id}/skills")
    assert get_skills_res.status_code == 200
    skill_names = [s["name"] for s in get_skills_res.json()]
    assert "Kubernetes" in skill_names
    assert "Terraform" in skill_names
