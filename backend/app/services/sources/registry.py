from app.services.sources.base import JobSource
from app.services.sources.greenhouse import GreenhouseAdapter
from app.services.sources.lever import LeverAdapter

GREENHOUSE_COMPANIES = [
    {
        "board_token": "stripe",
        "company_name": "Stripe",
    },
    {
        "board_token": "airbnb",
        "company_name": "Airbnb",
    },
    {
        "board_token": "databricks",
        "company_name": "Databricks",
    },
    {
        "board_token": "cloudflare",
        "company_name": "Cloudflare",
    },
]

LEVER_COMPANIES = [
    {
        "site_token": "spotify",
        "company_name": "Spotify",
    },
    {
        "site_token": "palantir",
        "company_name": "Palantir",
    },
    {
        "site_token": "leverdemo",
        "company_name": "Lever Demo",
    },
]


def get_greenhouse_sources() -> list[GreenhouseAdapter]:
    return [
        GreenhouseAdapter(
            board_token=config["board_token"],
            company_name=config["company_name"],
        )
        for config in GREENHOUSE_COMPANIES
    ]


def get_lever_sources() -> list[LeverAdapter]:
    return [
        LeverAdapter(
            site_token=config["site_token"],
            company_name=config["company_name"],
        )
        for config in LEVER_COMPANIES
    ]


def get_all_sources() -> list[JobSource]:
    """Returns all registered ATS sources across all adapters."""
    return [
        *get_greenhouse_sources(),
        *get_lever_sources(),
    ]