# incentive-app/backend/api/product_router.py

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from tempfile import NamedTemporaryFile
import shutil

from db.database import SessionLocal
from schemas.product_schema import ProductSubmit
from crud.product_crud import upsert_product, upsert_products_from_file
from utils.security import get_current_user_role
from models.product import Product
from models.trait_config import TraitConfig
router = APIRouter(prefix="/api/products", tags=["Products"])

# 🔌 DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 📦 Bulk Product Upload
@router.post("/upload-file")
def upload_product_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    """
    Admin: Upload an Excel/CSV file to bulk insert/update products.
    """
    if not file.filename.endswith((".xlsx", ".csv")):
        raise HTTPException(status_code=400, detail="Only .xlsx or .csv files are supported")

    try:
        with NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        result = upsert_products_from_file(db, tmp_path)
        return {"message": "File processed", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ➕ Manual Add/Update Product
@router.post("/add")
def add_product(
    payload: ProductSubmit,
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    """
    Admin: Add or update a single product manually by barcode.
    """
    try:
        upsert_product(db, payload)
        return {"message": "Product saved", "barcode": payload.barcode}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save product: {str(e)}")

@router.get("/{barcode}")
def get_product(barcode: str, db: Session = Depends(get_db)):
    barcode = barcode.strip()

    product = db.query(Product).filter(Product.barcode == barcode).first()
    if not product:
        product = db.query(Product).filter(Product.barcode.like(f"%{barcode}%")).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get the trait config percentage
    trait_config = db.query(TraitConfig).filter(TraitConfig.trait == product.trait).first()
    if not trait_config:
        raise HTTPException(status_code=404, detail="Trait percentage not found")

    return {
        "barcode": product.barcode,
        "price": product.rsp,
        "traitPercentage": trait_config.percentage
    }
