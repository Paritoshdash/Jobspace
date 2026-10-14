from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.acquisition import router as acquisition_router
from app.api.v1.applications import router as applications_router
from app.api.v1.auth import router as auth_router
from app.api.v1.jobs import router as jobs_router
<<<<<<< HEAD
from app.api.v1.profile import router as profile_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.resumes import router as resumes_router
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
from app.api.v1.saved_jobs import router as saved_jobs_router
from app.api.v1.users import router as users_router

app = FastAPI(
    title="JobSpace API",
<<<<<<< HEAD
    description="India-first AI-powered job intelligence and candidate matching platform",
    version="0.3.0",
=======
    description="AI-powered job intelligence and search platform",
    version="0.2.0",
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
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
<<<<<<< HEAD
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
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
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
