import sys
import os

# 👇 Add the root directory of your project to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from sqlalchemy import Column, Integer, String, Float, Boolean
from db.database import Base


class TraitConfig(Base):
    __tablename__ = "trait_configs"

    id = Column(Integer, primary_key=True, index=True)
    trait = Column(String, unique=True, index=True, nullable=False)  # e.g., "new", "old", "specialxyz1"
    percentage = Column(Float, nullable=True)  # e.g., 0.05 for 5%
    is_visible = Column(Boolean, default=True)  # Whether incentive is visible to salesman
