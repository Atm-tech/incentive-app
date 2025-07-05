from pydantic import BaseModel

class VerticleCreate(BaseModel):
    name: str
    description: str | None = None

class VerticleOut(BaseModel):
    id: int
    name: str
    description: str | None = None

    class Config:
        from_attributes = True