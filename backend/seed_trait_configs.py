import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy.orm import Session
from db.database import SessionLocal
from models.trait_config import TraitConfig

default_traits = [
    {"trait": "old", "percentage": 0.03, "is_visible": True},
    {"trait": "new", "percentage": 0.01, "is_visible": True},
    {"trait": "specialxyz1", "percentage": 0.05, "is_visible": False},
    {"trait": "specialxyz2", "percentage": 0.07, "is_visible": False},
]

def seed_traits():
    db: Session = SessionLocal()
    for item in default_traits:
        existing = db.query(TraitConfig).filter_by(trait=item["trait"]).first()
        if not existing:
            db.add(TraitConfig(**item))
    db.commit()
    db.close()
    print("✅ Trait configs seeded.")

if __name__ == "__main__":
    seed_traits()
