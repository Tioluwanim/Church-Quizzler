from sqlalchemy.orm import Session
from .models import Team, Question, Score
from sqlalchemy import func

# =====================
# TEAM CRUD
# =====================

def create_team(db: Session, name: str, color: str):
    team = Team(name=name, color=color)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def get_team(db: Session, team_id: int):
    return db.query(Team).filter(Team.id == team_id).first()


def get_teams(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Team).offset(skip).limit(limit).all()


def get_teams_by_name(db: Session, name: str):
    return db.query(Team).filter(Team.name == name).first()


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


def delete_team(db: Session, team_id: int):
    team = db.query(Team).filter(Team.id == team_id).first()
    if team:
        db.delete(team)
        db.commit()
    return team


# =====================
# QUESTION CRUD
# =====================

def create_question(db: Session, text: str, answer: str, category: str = None, points: int = 10):
    question = Question(text=text, answer=answer, category=category, points=points)
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def get_question(db: Session, question_id: int):
    return db.query(Question).filter(Question.id == question_id).first()


def get_questions(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Question).offset(skip).limit(limit).all()


def update_question(
    db: Session, question_id: int,
    text: str = None, answer: str = None,
    category: str = None, points: int = None
):
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


# =====================
# SCORE CRUD
# =====================

def award_points(db: Session, team_id: int, question_id: int, points: int):
    score = Score(team_id=team_id, question_id=question_id, points_awarded=points)
    db.add(score)
    db.commit()
    db.refresh(score)
    return score


def get_score(db: Session, score_id: int):
    return db.query(Score).filter(Score.id == score_id).first()


def get_scores_for_team(db: Session, team_id: int):
    return db.query(Score).filter(Score.team_id == team_id).all()


def get_scores_for_question(db: Session, question_id: int):
    return db.query(Score).filter(Score.question_id == question_id).all()


def delete_score(db: Session, score_id: int):
    score = db.query(Score).filter(Score.id == score_id).first()
    if score:
        db.delete(score)
        db.commit()
    return score


def get_scoreboard(db: Session):
    results = (
        db.query(
            Team.name.label("team_name"),
            func.coalesce(func.sum(Score.points_awarded), 0).label("total_points")
        )
        .outerjoin(Score, Team.id == Score.team_id)  # 👈 outer join includes teams with no scores
        .group_by(Team.id)
        .order_by(func.coalesce(func.sum(Score.points_awarded), 0).desc())
        .all()
    )

    return [
        {"team_name": row.team_name, "total_points": row.total_points}
        for row in results
    ]
