from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base, get_db
from app.api import auth, users, items, orders
from contextlib import asynccontextmanager

# Создаем таблицы при старте
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {e}")
    yield
    # Shutdown

app = FastAPI(title="Marketplace API", version="1.0.0", lifespan=lifespan)

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Роуты
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(items.router, prefix="/api/v1", tags=["Items"])
app.include_router(orders.router, prefix="/api/v1", tags=["Orders"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
