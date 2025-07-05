from pydantic import BaseModel

class TraitConfig(BaseModel):
    trait: str
    percentage: float
    is_visible: bool = False

class TraitUpdate(BaseModel):
    percentage: float | None = None
    is_visible: bool | None = None
