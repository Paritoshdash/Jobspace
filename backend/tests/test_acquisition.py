from unittest.mock import patch
from fastapi.testclient import TestClient


def test_acquisition_sources_endpoint(client: TestClient):
    res = client.get("/api/v1/acquisition/sources")
    assert res.status_code == 200
    data = res.json()
    assert "greenhouse" in data
    assert "lever" in data
    assert data["total_sources"] > 0
    # Check registered companies
    gh_companies = [c["company_name"] for c in data["greenhouse"]]
    assert "Stripe" in gh_companies
    assert "Airbnb" in gh_companies
    lever_companies = [c["company_name"] for c in data["lever"]]
    assert "Spotify" in lever_companies


def test_acquisition_backfill_and_reprocess_endpoints(client: TestClient):
    with patch("app.api.v1.acquisition.backfill_missing_embeddings", return_value=3):
        res_embed = client.post("/api/v1/acquisition/backfill-embeddings?limit=5")
        assert res_embed.status_code == 200
        assert res_embed.json()["jobs_embedded"] == 3

    with patch("app.api.v1.acquisition.reprocess_failed_analyses", return_value=2):
        res_reprocess = client.post("/api/v1/acquisition/reprocess-failed?limit=5")
        assert res_reprocess.status_code == 200
        assert res_reprocess.json()["jobs_reprocessed"] == 2
