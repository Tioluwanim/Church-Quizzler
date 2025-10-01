from .db import Base, engine
from .models import Team, Question, Score

if __name__ == "__main__":
    print("⚠️ Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✅ All tables dropped!")

    print("🔄 Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created!")
