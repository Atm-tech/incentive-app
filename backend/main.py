from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base
from api import (
    auth_router,
    sales_router,
    incentive_router,
    admin_router,
    upload_router,
    trait_router,
    product_router,
    secure_test_router,
    outlet_router,
    public_router,
    streak_router,
    salesman_router,
    verticle_router,
    actual_sale_router
)
from api.claim_router import router as claim_router
from api.wallet_router import router as wallet_router
from api.leaderboard_router import router as leaderboard_router
import logging

logging.basicConfig(level=logging.DEBUG)

app = FastAPI(title="Incentive Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://incentive-app-vert.vercel.app","https://incentive-app-gf1z.onrender.com","https://www.sales.advancedtradingmart.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers (register each router only ONCE, and with consistent tags)
app.include_router(auth_router.router,      prefix="/api/auth",       tags=["Auth"])
app.include_router(sales_router.router,     prefix="/api/sales",      tags=["Sales"])
app.include_router(incentive_router.router, prefix="/api/incentives", tags=["Incentives"])
app.include_router(upload_router.router,    prefix="/api/upload",     tags=["Upload"])
app.include_router(admin_router.router,     prefix="/api/admin",      tags=["Admin"])
app.include_router(trait_router.router,     prefix="/api/admin",      tags=["TraitConfig"])
app.include_router(actual_sale_router.router, prefix="/api",          tags=["ActualSale"])
app.include_router(product_router.router,   prefix="/api/products",   tags=["Products"])
app.include_router(secure_test_router.router)
app.include_router(outlet_router.router,    prefix="/api/admin",      tags=["Outlet"])
app.include_router(public_router.router,    prefix="/api/public",     tags=["Public"])
app.include_router(streak_router.router,    prefix="/api",            tags=["Streaks"])
app.include_router(leaderboard_router,      prefix="/api/leaderboard",tags=["Leaderboard"])
app.include_router(claim_router,            prefix="/api",            tags=["Claims"])
app.include_router(salesman_router.router,  prefix="/api/salesman",   tags=["Salesman"])
app.include_router(verticle_router.router,  prefix="/api/admin",      tags=["Verticles"])
app.include_router(wallet_router,           prefix="/api",            tags=["Wallet"])
