from sqlalchemy.orm import Session
from .models import Team, Question, Score
from sqlalchemy import func

# =====================
# TEAM CRUD
# =====================
def create_team(db: Session, name: str, color: str, timer_seconds: int = 30):
    team = Team(name=name, color=color, timer_seconds=timer_seconds)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team

def get_team(db: Session, team_id: int):
    return db.query(Team).filter(Team.id == team_id).first()

def get_teams(db: Session):
    # ✅ No limit: fetch all teams
    return db.query(Team).all()

def update_team(db: Session, team_id: int, new_name: str = None, new_color: str = None, new_timer: int = None):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team: return None
    if new_name: team.name = new_name
    if new_color: team.color = new_color
    if new_timer is not None: team.timer_seconds = new_timer
    db.commit()
    db.refresh(team)
    return team

def delete_team(db: Session, team_id: int):
    team = db.query(Team).filter(Team.id == team_id).first()
    if team:
        db.delete(team)
        db.commit()
    return team

# =====================
# QUESTION CRUD
# =====================
def create_question(db: Session, text: str, answer: str, category: str = None, points: int = 10, options=None):
    question = Question(text=text, answer=answer, category=category, points=points, options=options)
    db.add(question)
    db.commit()
    db.refresh(question)
    return question

def get_questions(db: Session, category: str = None):
    q = db.query(Question)
    if category:
        q = q.filter(Question.category == category)
    return q.all()

def update_question(db: Session, question_id: int, text=None, answer=None, category=None, points=None, options=None):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question: return None
    if text: question.text = text
    if answer: question.answer = answer
    if category: question.category = category
    if points is not None: question.points = points
    if options is not None: question.options = options
    db.commit()
    db.refresh(question)
    return question

def delete_question(db: Session, question_id: int):
    question = db.query(Question).filter(Question.id == question_id).first()
    if question:
        db.delete(question)
        db.commit()
    return question

# =====================
# SCORE CRUD
# =====================
def award_points(db: Session, team_id: int, question_id: int, points: int):
    score = Score(team_id=team_id, question_id=question_id, points_awarded=points)
    db.add(score)
    db.commit()
    db.refresh(score)
    return score

def get_scores_for_team(db: Session, team_id: int):
    return db.query(Score).filter(Score.team_id == team_id).all()

def get_scoreboard(db: Session):
    results = (
        db.query(Team.name.label("team_name"),
                 func.coalesce(func.sum(Score.points_awarded), 0).label("total_points"))
        .outerjoin(Score, Team.id == Score.team_id)
        .group_by(Team.id)
        .order_by(func.coalesce(func.sum(Score.points_awarded), 0).desc())
        .all()
    )
    return [{"team_name": r.team_name, "total_points": r.total_points} for r in results]
