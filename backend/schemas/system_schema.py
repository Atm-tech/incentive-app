from pydantic import BaseModel

class SetupStatusOut(BaseModel):
    setup_complete: bool

    class Config:
        orm_mode = True
