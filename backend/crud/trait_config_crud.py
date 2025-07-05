from sqlalchemy.orm import Session
from models.trait_config import TraitConfig


def get_all_traits(db: Session) -> list[TraitConfig]:
    """
    Return all trait configurations.
    """
    return db.query(TraitConfig).all()


def get_trait_by_name(db: Session, trait: str) -> TraitConfig | None:
    """
    Fetch a single trait configuration by its name.
    """
    return db.query(TraitConfig).filter_by(trait=trait).first()


def update_trait(
    db: Session,
    trait: str,
    percentage: float = None,
    is_visible: bool = None
) -> TraitConfig | None:
    """
    Update percentage and/or visibility for a given trait.
    Returns the updated TraitConfig or None if trait not found.
    """
    record = db.query(TraitConfig).filter_by(trait=trait).first()
    if not record:
        return None

    if percentage is not None:
        record.percentage = percentage
    if is_visible is not None:
        record.is_visible = is_visible

    try:
        db.commit()
        db.refresh(record)
    except Exception as e:
        db.rollback()
        raise e

    return record


def create_trait(
    db: Session,
    trait: str,
    percentage: float,
    is_visible: bool = False
) -> TraitConfig:
    """
    Create a new trait configuration.
    Raises ValueError if the trait already exists.
    """
    existing = db.query(TraitConfig).filter_by(trait=trait).first()
    if existing:
        raise ValueError("Trait already exists")

    new_trait = TraitConfig(
        trait=trait,
        percentage=percentage,
        is_visible=is_visible
    )

    try:
        db.add(new_trait)
        db.commit()
        db.refresh(new_trait)
    except Exception as e:
        db.rollback()
        raise e

    return new_trait


def delete_trait(db: Session, trait: str) -> bool:
    """
    Delete a trait configuration by name.
    Returns True if deleted, False if not found.
    """
    record = db.query(TraitConfig).filter_by(trait=trait).first()
    if not record:
        return False

    try:
        db.delete(record)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

    return True
