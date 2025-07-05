from pydantic import BaseModel

class ProductSubmit(BaseModel):
    barcode: str
    verticle: str  # corrected spelling here
    trait: str
    rsp: float

class ProductOut(ProductSubmit):
    class Config:
        from_attributes = True

class ProductUploadRow(BaseModel):
    barcode: str
    verticle: str
    trait: str
    rsp: float