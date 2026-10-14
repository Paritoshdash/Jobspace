from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.acquisition import router as acquisition_router
from app.api.v1.applications import router as applications_router
from app.api.v1.auth import router as auth_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.profile import router as profile_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.saved_jobs import router as saved_jobs_router
from app.api.v1.users import router as users_router

app = FastAPI(
    title="JobSpace API",
    description="India-first AI-powered job intelligence and candidate matching platform",
    version="0.3.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    users_router,
    prefix="/api/v1",
)

app.include_router(
    profile_router,
    prefix="/api/v1",
)

app.include_router(
    resumes_router,
    prefix="/api/v1",
)

app.include_router(
    recommendations_router,
    prefix="/api/v1",
)

app.include_router(
    jobs_router,
    prefix="/api/v1",
)

app.include_router(
    saved_jobs_router,
    prefix="/api/v1",
)

app.include_router(
    applications_router,
    prefix="/api/v1",
)

app.include_router(
    acquisition_router,
    prefix="/api/v1",
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "jobspace-api",
    }
