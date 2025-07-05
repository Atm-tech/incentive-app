from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import SessionLocal
from utils.security import get_current_user_role

import pandas as pd
from io import BytesIO
from models.actual_sale import ActualSale
from models.product import Product

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/sales-file")
async def upload_sales_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    """
    Admin-only: Upload Excel file with actual sales.
    Skips exact duplicates. Returns summary.
    Required columns: date, customer, barcode, qty, net amount
    """
    try:
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))

        required_columns = {"date", "customer", "barcode", "qty", "net amount"}
        if not required_columns.issubset(df.columns):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Required columns: date, customer, barcode, qty, net amount"
            )

        inserted = 0
        skipped = 0
        skipped_dates = set()

        for _, row in df.iterrows():
            try:
                sale_data = {
                    "date": pd.to_datetime(row["date"]),
                    "customer": str(row["customer"]),
                    "barcode": str(row["barcode"]),
                    "qty": int(row["qty"]),
                    "net_amount": float(row["net amount"]),
                }
            except Exception as e:
                skipped += 1
                continue

            exists = db.query(ActualSale).filter_by(**sale_data).first()
            if exists:
                skipped += 1
                skipped_dates.add(sale_data["date"].strftime("%Y-%m-%d"))
                continue

            db.add(ActualSale(**sale_data))
            inserted += 1

        db.commit()

        return {
            "message": "Sales file processed.",
            "inserted": inserted,
            "skipped": skipped,
            "skipped_dates": sorted(list(skipped_dates))
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")


@router.post("/base-file")
async def upload_base_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(get_current_user_role("admin"))
):
    """
    Admin-only: Upload Excel file with base product info.
    Upserts product based on barcode.
    Required columns: barcode, verticle, trait, rsp
    """
    try:
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))

        required_columns = {"barcode", "verticle", "trait", "rsp"}
        if not required_columns.issubset(df.columns):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Required columns: barcode, verticle, trait, rsp"
            )

        for _, row in df.iterrows():
            try:
                product = Product(
                    barcode=str(row["barcode"]),
                    verticle=str(row["verticle"]),
                    trait=str(row["trait"]),
                    rsp=float(row["rsp"]),
                )
                db.merge(product)  # upsert
            except Exception:
                continue

        db.commit()
        return {"message": "Base file uploaded and stored successfully."}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload failed: {str(e)}")
