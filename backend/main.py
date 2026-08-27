import os
from dotenv import load_dotenv
load_dotenv()
import sys
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import engine, get_db
import models
import auth

# Create DB tables
models.Base.metadata.create_all(bind=engine)

# Add the agent-core directory to the system path so we can import the orchestrator
current_dir = os.path.dirname(os.path.abspath(__file__))
agent_core_path = os.path.abspath(os.path.join(current_dir, "../agent-core"))
sys.path.append(agent_core_path)

try:
    from orchestrator import VeriFyOrchestrator
except ImportError as e:
    print(f"Error importing orchestrator: {e}")
    print("Ensure the agent-core directory exists and contains orchestrator.py")
    sys.exit(1)

app = FastAPI(title="VeriFy API", description="Backend for the VeriFy AI Agent System")

# Enable CORS so the frontend (React/Vue/etc.) can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # NOTE: For production, change this to your specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global orchestrator instance (initialized on startup)
orchestrator = None

@app.on_event("startup")
def startup_event():
    global orchestrator
    try:
        # This will look for GROQ_API_KEY in the environment
        if not os.getenv("GROQ_API_KEY") or not os.getenv("TAVILY_API_KEY"):
            print("Warning: GROQ_API_KEY or TAVILY_API_KEY is missing. Agent core won't work!")
        
        orchestrator = VeriFyOrchestrator()
        print("Successfully initialized VeriFy Orchestrator.")
    except Exception as e:
        print(f"Warning: Orchestrator failed to initialize on startup: {e}")
        print("Please ensure GROQ_API_KEY is set in your environment variables.")

# --- API Models ---
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

# --- Routes ---
@app.get("/")
def read_root():
    return {"status": "VeriFy API is running.", "orchestrator_ready": orchestrator is not None}

@app.post("/api/auth/signup", response_model=TokenResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(name=user.name, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_name": new_user.name}

@app.post("/api/auth/signin", response_model=TokenResponse)
def signin(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_name": db_user.name}

@app.post("/api/verify", response_model=QueryResponse)
def verify_claim(request: QueryRequest):
    global orchestrator
    
    if not orchestrator:
        # Attempt to re-initialize in case keys were added after startup
        try:
            orchestrator = VeriFyOrchestrator()
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Orchestrator not ready. Ensure GROQ_API_KEY is set. Error: {e}"
            )
            
    try:
        print(f"Received API request for query: {request.query}")
        # Run the full agent pipeline
        result_dict = orchestrator.process_query(request.query)
        return QueryResponse(response=result_dict)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"API Error processing query: {e}")
        return QueryResponse(response=None, error=str(e))

class CertificateCreate(BaseModel):
    question: str
    final_answer: str
    confidence_score: int
    trust_explanation: str

@app.post("/api/certificates")
def create_certificate(cert: CertificateCreate, db: Session = Depends(get_db)):
    import uuid
    from datetime import datetime
    
    cert_id = str(uuid.uuid4())
    new_cert = models.Certificate(
        id=cert_id,
        user_id=0, # Anonymous or link to user if we extract token
        question=cert.question,
        final_answer=cert.final_answer,
        confidence_score=cert.confidence_score,
        trust_explanation=cert.trust_explanation,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    return {"certificate_id": cert_id}

@app.get("/api/certificates/{cert_id}")
def get_certificate(cert_id: str, db: Session = Depends(get_db)):
    db_cert = db.query(models.Certificate).filter(models.Certificate.id == cert_id).first()
    if not db_cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return db_cert

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
