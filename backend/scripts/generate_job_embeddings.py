import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.job import Job
from app.services.ai.job_embedding_service import generate_job_embedding


def main():
    db = SessionLocal()

    try:
        jobs = (
            db.query(Job)
            .filter(Job.embedding.is_(None))
            .all()
        )

        print(f"Jobs needing embeddings: {len(jobs)}")

        for job in jobs:
            print(f"Generating embedding for Job {job.id}: {job.title}")

            generate_job_embedding(
                db=db,
                job=job,
            )

            print(f"✓ Job {job.id} embedded")

        db.commit()

        print("All missing job embeddings generated successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()