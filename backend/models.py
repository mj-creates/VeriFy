from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String, primary_key=True, index=True) # UUID
    user_id = Column(Integer)
    question = Column(String)
    final_answer = Column(String)
    confidence_score = Column(Integer)
    trust_explanation = Column(String)
    created_at = Column(String)
