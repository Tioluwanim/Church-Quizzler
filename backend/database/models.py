from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func, JSON
from sqlalchemy.orm import relationship
from .db import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    color = Column(String(50), nullable=False)
    timer_seconds = Column(Integer, default=30)
    # relationships
    scores = relationship("Score", back_populates="team", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)               # ✅ multiple choice if provided
    category = Column(String(100), nullable=True)       # ✅ session/category
    points = Column(Integer, default=10)

    # relationships
    scores = relationship("Score", back_populates="question", cascade="all, delete-orphan")


class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    points_awarded = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationships
    team = relationship("Team", back_populates="scores")
    question = relationship("Question", back_populates="scores")
