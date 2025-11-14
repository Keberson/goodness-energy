from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, npo, volunteer, admin, news, files, map

# Создаем таблицы
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Social Hack 2025 API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(map.router, prefix="/map", tags=["map"])
app.include_router(npo.router, prefix="/npo", tags=["npo"])
app.include_router(volunteer.router, prefix="/volunteer", tags=["volunteer"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(news.router, prefix="/news", tags=["news"])
app.include_router(files.router, prefix="/files", tags=["files"])

@app.get("/")
async def root():
    return {"message": "Social Hack 2025 API"}

