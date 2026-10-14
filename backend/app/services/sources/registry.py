<<<<<<< HEAD
from app.services.sources.ashby import AshbyAdapter
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
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
<<<<<<< HEAD
    {
        "board_token": "gitlab",
        "company_name": "GitLab",
    },
    {
        "board_token": "razorpaysoftwareprivatelimited",
        "company_name": "Razorpay",
    },
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
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

<<<<<<< HEAD
ASHBY_COMPANIES = [
    {
        "company_token": "linear",
        "company_name": "Linear",
    },
    {
        "company_token": "retool",
        "company_name": "Retool",
    },
    {
        "company_token": "ramp",
        "company_name": "Ramp",
    },
]

=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5

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


<<<<<<< HEAD
def get_ashby_sources() -> list[AshbyAdapter]:
    return [
        AshbyAdapter(
            company_token=config["company_token"],
            company_name=config["company_name"],
        )
        for config in ASHBY_COMPANIES
    ]


def get_all_sources() -> list[JobSource]:
    """Returns all registered ATS sources across all adapters (Greenhouse, Lever, Ashby)."""
    return [
        *get_greenhouse_sources(),
        *get_lever_sources(),
        *get_ashby_sources(),
=======
def get_all_sources() -> list[JobSource]:
    """Returns all registered ATS sources across all adapters."""
    return [
        *get_greenhouse_sources(),
        *get_lever_sources(),
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
    ]