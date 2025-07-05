# incentive-app/backend/api/secure_test_router.py

from fastapi import APIRouter, Depends
from utils.security import get_current_user_role

router = APIRouter(prefix="/secure-test", tags=["Secure Testing"])

@router.get("/admin-only")
def view_admin_stuff(admin=Depends(get_current_user_role("admin"))):
    return {"message": f"Welcome admin {admin.mobile}"}

@router.get("/salesman-only")
def view_sales_data(salesman=Depends(get_current_user_role("salesman"))):
    return {"message": f"Welcome salesman {salesman.mobile}"}
