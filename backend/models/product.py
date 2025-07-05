from sqlalchemy import Column, String, Float
from db.database import Base

class Product(Base):
    __tablename__ = "products"
    
    barcode = Column(String, primary_key=True, index=True)
    verticle = Column(String, index=True)  # added index for faster lookup
    trait = Column(String)                 # e.g., old / new / specialxyz
    rsp = Column(Float)                    # retail selling price
