from fastapi.testclient import TestClient


def test_candidate_profile_crud(client: TestClient, auth_headers: dict):
    # 1. Get initial profile
    res = client.get("/api/v1/profile/me", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "user_id" in data
    assert "completion_percentage" in data

    # 2. Update profile details
    update_payload = {
        "full_name": "Arjun Sharma",
        "headline": "Senior Full Stack Python Engineer",
        "summary": "Experienced software architect passionate about scalable web platforms.",
        "phone": "+91 9876543210",
        "location": "Bengaluru, India",
        "experience_level": "senior",
        "preferred_location": "Bengaluru",
        "preferred_role": "Python Backend Engineer",
        "preferred_employment_type": "Full-time",
        "expected_salary_min": 1800000,
    }
    update_res = client.put("/api/v1/profile/me", json=update_payload, headers=auth_headers)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["full_name"] == "Arjun Sharma"
    assert updated["headline"] == "Senior Full Stack Python Engineer"
    assert updated["expected_salary_min"] == 1800000
    assert updated["completion_percentage"] > 0

    # 3. Add Skill
    skill_res = client.post(
        "/api/v1/profile/skills",
        json={"name": "FastAPI", "proficiency": "Advanced", "years_experience": 4.0},
        headers=auth_headers,
    )
    assert skill_res.status_code == 201
    skill_data = skill_res.json()
    assert skill_data["normalized_name"] == "fastapi"
    skill_id = skill_data["id"]

    # 4. Add Education
    edu_res = client.post(
        "/api/v1/profile/education",
        json={
            "institution": "IIT Kharagpur",
            "degree": "B.Tech",
            "field_of_study": "Computer Science",
            "start_year": 2018,
            "end_year": 2022,
        },
        headers=auth_headers,
    )
    assert edu_res.status_code == 201
    edu_id = edu_res.json()["id"]

    # 5. Add Experience
    exp_res = client.post(
        "/api/v1/profile/experience",
        json={
            "company": "TechNova Solutions",
            "title": "Backend Engineer",
            "location": "Bengaluru",
            "start_date": "2022-07",
            "end_date": "2024-09",
            "is_current": False,
            "description": "Architected high-throughput REST APIs and microservices.",
        },
        headers=auth_headers,
    )
    assert exp_res.status_code == 201
    exp_id = exp_res.json()["id"]

    # 6. Verify full profile
    verify_res = client.get("/api/v1/profile/me", headers=auth_headers)
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert len(v_data["skills"]) >= 1
    assert len(v_data["educations"]) >= 1
    assert len(v_data["experiences"]) >= 1

    # Cleanup added items
    client.delete(f"/api/v1/profile/skills/{skill_id}", headers=auth_headers)
    client.delete(f"/api/v1/profile/education/{edu_id}", headers=auth_headers)
    client.delete(f"/api/v1/profile/experience/{exp_id}", headers=auth_headers)
