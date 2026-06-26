import sys
import os

# Add the parent directory to the system path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.policy import PolicySection
from app.services.embedding_service import embedding_service

def reembed_all():
    db = SessionLocal()
    try:
        sections = db.query(PolicySection).filter(PolicySection.embedding.is_(None)).all()
        print(f"Found {len(sections)} sections without embeddings.")
        
        for idx, section in enumerate(sections):
            print(f"[{idx+1}/{len(sections)}] Generating embedding for section {section.id}...")
            embedding_json = embedding_service.embed_to_json(section.content)
            if embedding_json:
                section.embedding = embedding_json
                db.commit()
                print(f"  -> Success.")
            else:
                print(f"  -> Failed to generate embedding.")
                
        print("Done re-embedding.")
    finally:
        db.close()

if __name__ == "__main__":
    reembed_all()
