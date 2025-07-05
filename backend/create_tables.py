from db.database import Base, engine

# ✅ Import all models
from models.sale import Sale
from models.actual_sale import ActualSale
from models.product import Product
from models.incentive import Incentive
from models.trait_config import TraitConfig
from models.salesman import Salesman  # <== most likely missing


print("✅ All tables created.")