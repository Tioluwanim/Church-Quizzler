import os
import re
import json
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from werkzeug.utils import secure_filename
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from docx import Document
import PyPDF2

# Absolute imports from your package
from database.db import Base, engine, SessionLocal
from database import crud, models

# =====================
# App setup
# =====================
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"txt", "docx", "pdf"}

app = FastAPI(title="Church Quiz API", version="1.3")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create DB tables (safe on startup)
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
    timer_seconds: int

    class Config:
        orm_mode = True

class QuestionCreate(BaseModel):
    text: str
    answer: str
    category: Optional[str] = None
    points: Optional[int] = 10
    options: Optional[List[str]] = None

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
    updated = crud.update_team(
        db,
        team_id,
        new_name=team.name,
        new_color=team.color,
        new_timer=team.timer_seconds
    )
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
    return crud.create_question(db,
                                text=question.text,
                                answer=question.answer,
                                category=question.category,
                                points=question.points,
                                options=question.options)

@app.get("/questions", response_model=List[QuestionOut])
def get_questions(db: Session = Depends(get_db)):
    return crud.get_questions(db)

@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = crud.get_categories_from_questions(db)
    return [{"id": i + 1, "name": str(c)} for i, c in enumerate(categories)]

@app.get("/categories/{category_id}/questions", response_model=List[QuestionOut])
def get_questions_by_category(category_id: int, db: Session = Depends(get_db)):
    categories = crud.get_categories_from_questions(db)
    if category_id < 1 or category_id > len(categories):
        raise HTTPException(status_code=404, detail="Category not found")

    category_name = categories[category_id - 1]
    return crud.get_questions_by_category(db, category_name)

# =====================
# UPLOAD QUESTIONS (FIXED)
# =====================
@app.post("/questions/upload")
def upload_questions(file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    with open(filepath, "wb") as f:
        f.write(file.file.read())

    # Read file content
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
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"

    created = []
    for line in text.splitlines():
        line = line.strip()
        if not line or "|" not in line:
            continue

        # 🔹 Remove numbering like "1." or "12."
        line = re.sub(r'^\d+\.\s*', '', line)

        parts = [p.strip() for p in line.split("|")]

        # Expect format: Question | Answer | Category | Points
        q_text = parts[0] if len(parts) > 0 else ""
        q_answer = parts[1] if len(parts) > 1 else ""
        q_category = parts[2] if len(parts) > 2 else None

        try:
            q_points = int(parts[3]) if len(parts) > 3 else 10
        except ValueError:
            q_points = 10

        # Optional options field
        q_options = None
        if len(parts) > 4 and parts[4].strip():
            try:
                q_options = json.loads(parts[4]) if (parts[4].strip().startswith("[") and parts[4].strip().endswith("]")) else [o.strip() for o in parts[4].split(",")]
            except Exception:
                q_options = [o.strip() for o in parts[4].split(",")]

        # Debug print (can remove later)
        print(f"Uploading -> Q: {q_text} | A: {q_answer} | C: {q_category} | P: {q_points}")

        question = crud.create_question(
            db,
            text=q_text,
            answer=q_answer,
            category=q_category,
            points=q_points,
            options=q_options,
        )
        created.append(question)

    return {"uploaded": len(created), "questions": created}

# =====================
# SCORE ROUTES
# =====================
@app.post("/scores", response_model=ScoreOut)
def award_score(score: ScoreCreate, db: Session = Depends(get_db)):
    return crud.award_points(db, team_id=score.team_id, question_id=score.question_id, points=score.points)

@app.get("/teams/{team_id}/scores")
def team_scores(team_id: int, db: Session = Depends(get_db)):
    return crud.get_scores_for_team(db, team_id)

@app.get("/scoreboard")
def scoreboard(db: Session = Depends(get_db)):
    """Returns overall scoreboard (all teams always included)."""
    return crud.get_scoreboard(db)

@app.get("/scoreboard/category/{category}")
def scoreboard_by_category(category: str, db: Session = Depends(get_db)):
    """Returns scoreboard for a specific category (all teams always included)."""
    return crud.get_scoreboard_by_category(db, category)

# =====================
# Serve frontend if built
# =====================
frontend_build_path = os.path.join(os.path.dirname(__file__), "../frontend/dist")
if os.path.exists(frontend_build_path):
    static_assets = os.path.join(frontend_build_path, "assets")
    if os.path.exists(static_assets):
        app.mount("/assets", StaticFiles(directory=static_assets), name="assets")
    app.mount("/", StaticFiles(directory=frontend_build_path, html=True), name="frontend")

    @app.get("/{full_path:path}")
    def catch_all(full_path: str):
        return FileResponse(os.path.join(frontend_build_path, "index.html"))
