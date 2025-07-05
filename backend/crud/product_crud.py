import pandas as pd
from sqlalchemy.orm import Session
from models.product import Product
from models.verticle import Verticle
from schemas.product_schema import ProductSubmit
from sqlalchemy import func


def get_or_create_verticle(db: Session, name: str) -> Verticle:
    name_clean = name.strip().lower()
    verticle = db.query(Verticle).filter(func.lower(Verticle.name) == name_clean).first()
    if not verticle:
        verticle = Verticle(name=name_clean)
        db.add(verticle)
        db.commit()
        db.refresh(verticle)
    return verticle


def upsert_product(db: Session, payload: ProductSubmit) -> Product:
    """
    Insert or update a single product row.
    Also creates Verticle if not already present (case-insensitive).
    """
    try:
        get_or_create_verticle(db, payload.verticle)

        existing = db.query(Product).filter_by(barcode=payload.barcode).first()

        if existing:
            existing.verticle = payload.verticle.strip().lower()
            existing.trait = payload.trait.strip()
            existing.rsp = payload.rsp
        else:
            new = Product(
                barcode=payload.barcode.strip(),
                verticle=payload.verticle.strip().lower(),
                trait=payload.trait.strip(),
                rsp=payload.rsp
            )
            db.add(new)

        db.commit()
        return existing or new

    except Exception as e:
        db.rollback()
        raise e


def upsert_products_from_file(db: Session, file_path: str) -> dict:
    """
    Insert products from Excel/CSV. Skips duplicates. Logs failures.
    """
    try:
        if file_path.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_path)
        elif file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            raise ValueError("Unsupported file format. Use .xlsx or .csv")

        required_columns = {"barcode", "verticle", "trait", "rsp"}
        if not required_columns.issubset(set(df.columns)):
            raise ValueError(f"Missing columns: {required_columns - set(df.columns)}")

        inserted = 0
        skipped = []

        for idx, row in df.iterrows():
            barcode = str(row.get("barcode")).strip()
            if not barcode or pd.isna(barcode):
                skipped.append({"row": idx + 2, "reason": "Missing barcode"})
                continue

            verticle = str(row.get("verticle", "")).strip().lower()
            trait = str(row.get("trait", "")).strip()
            try:
                rsp = float(row.get("rsp", 0.0))
            except:
                skipped.append({"row": idx + 2, "barcode": barcode, "reason": "Invalid RSP"})
                continue

            get_or_create_verticle(db, verticle)

            # skip duplicate barcodes
            if db.query(Product).filter_by(barcode=barcode).first():
                skipped.append({"row": idx + 2, "barcode": barcode, "reason": "Duplicate barcode"})
                continue

            try:
                db.add(Product(
                    barcode=barcode,
                    verticle=verticle,
                    trait=trait,
                    rsp=rsp
                ))
                inserted += 1
            except Exception as e:
                skipped.append({"row": idx + 2, "barcode": barcode, "reason": str(e)})

        db.commit()
        return {
            "inserted": inserted,
            "skipped": skipped
        }

    except Exception as e:
        db.rollback()
        raise e

