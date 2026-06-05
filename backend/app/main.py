from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.routers import products, customers, orders, dashboard

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Inventory & Order Management System API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)

@app.get("/", tags=["Health"])
def root():
    return {"message": "Inventory & Order Management System API", "status": "running", "docs": "/docs"}

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
