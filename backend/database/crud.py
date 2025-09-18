from sqlalchemy.orm import Session
from sqlalchemy import func
from database.models import Score
from models import Team, Question
#------------- TEAM -------------#
# Create
def create_team(db: Session, name: str, color: str):
    team = Team(name=name, color=color)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team

# Read
def get_team(db: Session, team_id: int):
    return db.query(Team).filter(Team.id == team_id).first()

def get_teams(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Team).offset(skip).limit(limit).all()
def get_teams_by_name(db: Session, name: str):
    return db.query(Team).filter(Team.name == name).first()

# Update
def update_team(db: Session, team_id: int, new_name: str = None, new_color: str = None):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        return None
    if new_name:
        team.name = new_name
    if new_color:
        team.color = new_color
    db.commit()
    db.refresh(team)
    return team

# Delete
def delete_team(db: Session, team_id: int):
    team = db.query(Team).filter(Team.id == team_id).first()
    if team:
        db.delete(team)
        db.commit()
    return team

#------------------- QUESTION
def create_question(db:Session, text: str, answer: str, category: str = None, points: int = 10):
    question = Question(text=text, answer=answer, category=category, points=points)
    db.add(question)
    db.commit()
    db.refresh(question)
    return question

def get_question(db: Session, question_id: int):
    return db.query(Question).filter(Question.id == question_id).first()

def get_question_answer(db: Session, question_id: int):
    return db.query(Question.answer).filter(Question.id == question_id).first()

def get_questions(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Question).offset(skip).limit(limit).all()

def update_question(db: Session, question_id: int, text: str = None, answer: str = None, category: str = None, points: int = None):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        return None
    if text:
        question.text = text
    if answer:
        question.answer = answer
    if category:
        question.category = category
    if points is not None:
        question.points = points
    db.commit()
    db.refresh(question)
    return question

def delete_question(db: Session, question_id: int):
    question = db.query(Question).filter(Question.id == question_id).first()
    if question:
        db.delete(question)
        db.commit()
    return question


# =======================
# SCORE CRUD
# =======================

# ---------------------
# Award Points
# ---------------------
def award_points(db: Session, team_id: int, question_id: int, points: int):
    """Award points to a team for a question."""
    score = Score(team_id=team_id, question_id=question_id, points_awarded=points)
    db.add(score)
    db.commit()
    db.refresh(score)
    return score


# ---------------------
# Remove Points (Option 1: negative transaction)
# ---------------------
def remove_points(db: Session, team_id: int, question_id: int, points: int):
    """Remove points by creating a negative score record (keeps history)."""
    score = Score(team_id=team_id, question_id=question_id, points_awarded=-abs(points))
    db.add(score)
    db.commit()
    db.refresh(score)
    return score


# ---------------------
# Adjust Points (Option 2: overwrite a record)
# ---------------------
def adjust_points(db: Session, score_id: int, new_points: int):
    """Update the points on an existing score entry."""
    score = db.query(Score).filter(Score.id == score_id).first()
    if not score:
        return None
    score.points_awarded = new_points
    db.commit()
    db.refresh(score)
    return score


# ---------------------
# Delete Score
# ---------------------
def delete_score(db: Session, score_id: int):
    """Completely delete a score record (use if awarded by mistake)."""
    score = db.query(Score).filter(Score.id == score_id).first()
    if score:
        db.delete(score)
        db.commit()
    return score


# ---------------------
# Totals and Scoreboard
# ---------------------
def get_scoreboard(db: Session):
    """
    Return all teams ordered by total points (highest first),
    including team name and color.
    """
    results = (
        db.query(
            Team.id.label("team_id"),
            Team.name.label("team_name"),
            Team.color.label("team_color"),
            func.coalesce(func.sum(Score.points_awarded), 0).label("total_points"),
        )
        .outerjoin(Score, Team.id == Score.team_id)
        .group_by(Team.id)
        .order_by(func.coalesce(func.sum(Score.points_awarded), 0).desc())
        .all()
    )
    return results