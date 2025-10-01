import os
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from werkzeug.utils import secure_filename
from fastapi.staticfiles import StaticFiles
from docx import Document
import PyPDF2

# Absolute imports
from database.db import Base, engine, SessionLocal
from database import crud, models

# =====================
# App setup
# =====================
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"txt", "docx", "pdf"}

app = FastAPI(title="Church Quiz API", version="1.1")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create database tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =====================
# Pydantic Schemas
# =====================
class TeamCreate(BaseModel):
    name: str
    color: Optional[str] = None
    timer_seconds: Optional[int] = 30

class TeamOut(BaseModel):
    id: int
    name: str
    color: Optional[str]
    class Config:
        orm_mode = True

class QuestionCreate(BaseModel):
    text: str
    answer: str
    category: Optional[str] = None
    points: Optional[int] = 10
    options: Optional[List[str]] = None   # ✅ added options here

class QuestionOut(BaseModel):
    id: int
    text: str
    answer: str
    category: Optional[str]
    points: int
    options: Optional[List[str]]
    class Config:
        orm_mode = True

class ScoreCreate(BaseModel):
    team_id: int
    question_id: int
    points: int

class ScoreOut(BaseModel):
    id: int
    team_id: int
    question_id: int
    points_awarded: int
    class Config:
        orm_mode = True

# =====================
# TEAM ROUTES
# =====================
@app.post("/teams", response_model=TeamOut)
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    return crud.create_team(
        db,
        name=team.name,
        color=team.color or "#6A0DAD",
        timer_seconds=team.timer_seconds
    )


@app.get("/teams", response_model=List[TeamOut])
def get_teams(db: Session = Depends(get_db)):
    return crud.get_teams(db)

@app.get("/teams/{team_id}", response_model=TeamOut)
def get_team(team_id: int, db: Session = Depends(get_db)):
    team = crud.get_team(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@app.put("/teams/{team_id}", response_model=TeamOut)
def update_team(team_id: int, team: TeamCreate, db: Session = Depends(get_db)):
    updated = crud.update_team(db, team_id, new_name=team.name, new_color=team.color)
    if not updated:
        raise HTTPException(status_code=404, detail="Team not found")
    return updated

@app.delete("/teams/{team_id}")
def delete_team(team_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_team(db, team_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": f"Team {deleted.name} deleted"}

# =====================
# QUESTION ROUTES
# =====================
@app.post("/questions", response_model=QuestionOut)
def create_question(question: QuestionCreate, db: Session = Depends(get_db)):
    return crud.create_question(
        db,
        text=question.text,
        answer=question.answer,
        category=question.category,
        points=question.points,
        options=question.options,   # ✅ pass options to CRUD
    )

@app.get("/questions", response_model=List[QuestionOut])
def get_questions(db: Session = Depends(get_db)):
    return crud.get_questions(db)

@app.post("/questions/upload")
def upload_questions(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    with open(filepath, "wb") as f:
        f.write(file.file.read())

    text = ""
    if ext == "txt":
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()
    elif ext == "docx":
        doc = Document(filepath)
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    elif ext == "pdf":
        pdf_reader = PyPDF2.PdfReader(filepath)
        for page in pdf_reader.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"

    created = []
    for line in text.split("\n"):
        if "|" in line:
            parts = line.split("|")
            q = parts[0].strip()
            a = parts[1].strip() if len(parts) > 1 else ""
            c = parts[2].strip() if len(parts) > 2 else None
            p = int(parts[3].strip()) if len(parts) > 3 and parts[3].strip().isdigit() else 10
            opts = [opt.strip() for opt in parts[4].split(",")] if len(parts) > 4 else None

            question = crud.create_question(
                db, text=q, answer=a, category=c, points=p, options=opts
            )
            created.append(question)
    return {"uploaded": len(created), "questions": created}

# =====================
# SCORE ROUTES
# =====================
@app.post("/scores", response_model=ScoreOut)
def award_score(score: ScoreCreate, db: Session = Depends(get_db)):
    return crud.award_points(db, team_id=score.team_id, question_id=score.question_id, points=score.points)

@app.get("/scoreboard")
def scoreboard(db: Session = Depends(get_db)):
    return crud.get_scoreboard(db)

# =====================
# SERVE REACT FRONTEND
# =====================
frontend_build_path = os.path.join(os.path.dirname(__file__), "../frontend/dist")
if not os.path.exists(frontend_build_path):
    raise RuntimeError(f"Frontend build folder not found: {frontend_build_path}")

app.mount("/", StaticFiles(directory=frontend_build_path, html=True), name="frontend")
