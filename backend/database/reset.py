from .db import Base, engine
from .models import Team, Question, Score

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created!")
