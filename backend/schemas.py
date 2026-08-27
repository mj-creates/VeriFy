from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_name: str

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    response: dict = None
    error: str = None

class CertificateCreate(BaseModel):
    question: str
    final_answer: str
    confidence_score: int
    trust_explanation: str
