from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.search_service import global_search_service
from app.schemas.search import GlobalSearchResponse # Şemanın varlığından eminiz

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/", response_model=GlobalSearchResponse)
def perform_search(q: str, db: Session = Depends(get_db)):
    # Boş veya çok kısa aramaları direkt boş döndürelim
    if not q or len(q) < 2:
        return {"users": [], "posts": [], "comments": []}
    
    # Servisi çağırıyoruz kanka
    return global_search_service(db, query=q)