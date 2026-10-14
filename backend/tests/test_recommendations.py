from fastapi.testclient import TestClient


def test_find_jobs_for_me(client: TestClient, auth_headers: dict):
    # Setup candidate preferences
    client.put(
        "/api/v1/profile/me",
        json={
            "full_name": "Deepak Patel",
            "preferred_role": "Python Backend Engineer",
            "preferred_location": "Bangalore",
            "experience_level": "junior",
        },
        headers=auth_headers,
    )
    client.post(
        "/api/v1/profile/skills",
        json={"name": "Python", "proficiency": "Expert"},
        headers=auth_headers,
    )

    # Call Find Jobs For Me
    res = client.get("/api/v1/recommendations?limit=10", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data
    assert "total_matches" in data
    assert isinstance(data["recommendations"], list)

    if data["recommendations"]:
        first = data["recommendations"][0]
        assert "job" in first
        assert "compatibility_score" in first
        assert "match_percentage" in first
        assert "match_reasons" in first
        assert first["match_percentage"] >= 35
        # Verify sorted descending
        scores = [r["compatibility_score"] for r in data["recommendations"]]
        assert scores == sorted(scores, reverse=True)
