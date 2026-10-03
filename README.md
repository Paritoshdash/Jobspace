# JobSpace — AI-Powered Job Intelligence & Semantic Search Engine

JobSpace is a **zero-cost, production-quality AI job intelligence platform** that replaces traditional keyword matching with natural-language semantic vector search.

Powered by **FastAPI**, **PostgreSQL + pgvector**, **Ollama**, and **Next.js 15**, JobSpace indexes opportunities across top technology employers and ranks them by semantic contextual fit, extracted technical skills, and candidate preferences.

---

## Key Features

- **Natural-Language Semantic Job Search**: Search roles using conversational queries (e.g., *"Python AI Engineer in Bangalore with 0-2 years experience"*). Queries are parsed into query facets and matched using high-dimensional vector embeddings with cosine distance reranking.
- **Dual Multi-Source ATS Acquisition Pipeline**: Automated connectors ingest real-time postings directly from Greenhouse (Stripe, Airbnb, Databricks, Cloudflare) and Lever (Spotify, Palantir) job boards with deduplication and fault-tolerant pagination.
- **Skill Extraction & AI Summaries**: Automated extraction of technical skills and on-demand position summaries powered by local Ollama models.
- **Saved Jobs & Application Tracking**: Bookmark positions and track submissions through a structured pipeline (`Applied` ➔ `Interviewing` ➔ `Offer Received` ➔ `Rejected` / `Withdrawn`).
- **Overview Dashboard**: High-level personal dashboard tracking saved roles, active interviews, and recent submission statuses.
- **100% Zero-Cost Local Stack**: Completely self-hosted with zero dependency on paid cloud APIs (no OpenAI, no paid vector DBs, no third-party auth services).

---

## Architecture & Technology Stack

```
JobSpace/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/v1/           # REST endpoints (jobs, search, saved-jobs, applications, auth)
│   │   ├── core/             # Configuration, JWT security, auth dependencies
│   │   ├── db/               # PostgreSQL engine & session management
│   │   ├── models/           # SQLAlchemy models (Job, Skill, JobSkill, User, Application, SavedJob)
│   │   ├── schemas/          # Pydantic v2 validation models
│   │   └── services/         # Business logic, pgvector semantic search, LLM analyzer, ATS connectors
│   ├── alembic/              # Database migration versions
│   └── tests/                # Pytest test suite (23 passing tests)
│
├── frontend/                 # Next.js 15 Web Application
│   ├── app/                  # App Router pages (/, /jobs/[id], /saved, /applications, /dashboard, /login, /register)
│   ├── components/           # UI components (SearchBar, JobCard, FilterSidebar, Navbar, Footer)
│   ├── hooks/                # React hooks (useAuth)
│   └── lib/                  # Centralized API clients and TypeScript types
│
├── docker-compose.yml        # PostgreSQL 16 + pgvector container
└── README.md
```

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend API** | FastAPI / Python 3.12 | High-performance asynchronous REST API |
| **Database** | PostgreSQL 16 + pgvector | Relational storage and vector indexing |
| **Embeddings** | `nomic-embed-text` via Ollama | 768-dimensional text embeddings |
| **Local LLM** | `qwen3:14b` via Ollama | Job summarization and NLP query parsing |
| **ORM & Migrations** | SQLAlchemy 2.0 + Alembic | Type-safe database queries and migrations |
| **Frontend UI** | Next.js 15, React 19, TypeScript | Server and client-side web application |
| **Styling** | Tailwind CSS v4, Lucide React | Minimal, accessible, responsive design |
| **Authentication** | JWT (OAuth2 Password Bearer) | Zero-cost stateless user authentication |

---

## Getting Started

### 1. Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**
- **Docker Desktop**
- **Ollama** installed locally

---

### 2. Infrastructure Setup (Docker & Ollama)

#### A. Start PostgreSQL + pgvector
```bash
docker compose up -d
```
*PostgreSQL is exposed locally on port `5433` (username: `jobspace`, password: `jobspace`, database: `jobspace`).*

#### B. Start Ollama and Pull Required Models
Make sure Ollama is running (`http://localhost:11434`), then pull the embedding and chat models:
```bash
ollama pull nomic-embed-text
ollama pull qwen3:14b
```

---

### 3. Backend Setup

#### A. Create Virtual Environment & Install Dependencies
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### B. Configure Environment Variables
Copy `.env.example` to `backend/.env` (or project root):
```bash
cp ../.env.example .env
```

Ensure `DATABASE_URL` points to port `5433`:
```env
DATABASE_URL=
OLLAMA_BASE_URL=
OLLAMA_EMBED_MODEL=nomic-embed-text:latest
OLLAMA_CHAT_MODEL=qwen3:14b
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

#### C. Run Database Migrations
```bash
alembic upgrade head
```

#### D. Ingest Initial Job Opportunities (Optional)
Run the automated acquisition script to populate jobs from Greenhouse & Lever:
```bash
python -m scripts.run_acquisition
python -m scripts.generate_job_embeddings
```

#### E. Start the Backend Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger Documentation: `http://localhost:8000/docs`

---

### 4. Frontend Setup

#### A. Install Dependencies
```bash
cd ../frontend
npm install
```

#### B. Configure Frontend Environment
Ensure `frontend/.env.local` contains:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### C. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## API Endpoints Reference

### Authentication & Users
- `POST /api/v1/auth/register` — Create a new user account
- `POST /api/v1/auth/login` — Authenticate and receive a JWT access token
- `GET /api/v1/users/me` — Retrieve current authenticated user profile

### Job Search & Intelligence
- `GET /api/v1/jobs/search?q={query}` — Semantic search using natural language
- `GET /api/v1/jobs` — Filtered job listings (company, location, seniority, type)
- `GET /api/v1/jobs/facets` — Distinct facet counts for search filters
- `GET /api/v1/jobs/{id}` — Full job details with skills and descriptions
- `POST /api/v1/jobs/{id}/summarize` — Generate on-demand AI job summary

### Saved Jobs & Application Tracker
- `GET /api/v1/saved-jobs` — List user's bookmarked positions
- `POST /api/v1/saved-jobs/{job_id}` — Save/bookmark a job
- `DELETE /api/v1/saved-jobs/{job_id}` — Remove a job from bookmarks
- `GET /api/v1/saved-jobs/{job_id}/status` — Check if a job is bookmarked
- `GET /api/v1/applications` — List user's job applications
- `POST /api/v1/applications` — Track an application for a position
- `PATCH /api/v1/applications/{id}/status` — Update application stage (`applied`, `interviewing`, `offered`, `rejected`, `withdrawn`)
- `DELETE /api/v1/applications/{id}` — Delete or withdraw an application

---

## Testing & Quality Assurance

### Run Backend Test Suite
```bash
cd backend
pytest -v
```
*(All 23 unit and integration tests passing: auth, search, acquisition, saved jobs, and applications).*

### Run Frontend Linting & Production Build
```bash
cd frontend
npm run lint
npm run build
```
*(Validates TypeScript static types and compiles production bundles for all routes with zero errors).*

---

## License

This project is licensed under the MIT License.