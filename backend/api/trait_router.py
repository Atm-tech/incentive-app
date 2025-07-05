# incentive-app/backend/api/trait_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from crud import trait_config_crud
from utils.security import get_current_user_role
from schemas.trait_schema import TraitConfig, TraitUpdate
router = APIRouter()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/traits", response_model=list[dict])
def get_all_traits(
    db: Session = Depends(get_db),
    
):
    """
    Admin: Get all trait configurations.
    """
    traits = trait_config_crud.get_all_traits(db)
    return [
        {
            "trait": t.trait,
            "percentage": t.percentage,
            "is_visible": t.is_visible
        }
        for t in traits
    ]

@router.put("/traits/{trait}")
def update_trait_config(
    trait: str,
    payload: TraitUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    updated = trait_config_crud.update_trait(db, trait, payload.percentage, payload.is_visible)
    if not updated:
        raise HTTPException(status_code=404, detail="Trait not found")

    return {
        "message": "Trait updated",
        "data": {
            "trait": updated.trait,
            "percentage": updated.percentage,
            "is_visible": updated.is_visible
        }
    }


@router.post("/traits")
def create_trait_config(
    payload: TraitConfig,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    created = trait_config_crud.create_trait(db, payload.trait, payload.percentage, True)
    return {
        "message": "Trait created",
        "trait": created.trait
    }


@router.delete("/traits/{trait}")
def delete_trait_config(
    trait: str,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    """
    Admin: Delete trait by name.
    """
    success = trait_config_crud.delete_trait(db, trait)
    if not success:
        raise HTTPException(status_code=404, detail="Trait not found")
    return {
        "message": "Trait deleted"
    }
