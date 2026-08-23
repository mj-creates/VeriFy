import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
        # This will look for OPENAI_API_KEY in the environment
        orchestrator = VeriFyOrchestrator()
        print("Successfully initialized VeriFy Orchestrator.")
    except Exception as e:
        print(f"Warning: Orchestrator failed to initialize on startup: {e}")
        print("Please ensure OPENAI_API_KEY is set in your environment variables.")

# --- API Models ---
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    response: str
    error: str = None

# --- Routes ---
@app.get("/")
def read_root():
    return {"status": "VeriFy API is running.", "orchestrator_ready": orchestrator is not None}

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
                detail=f"Orchestrator not ready. Ensure OPENAI_API_KEY is set. Error: {e}"
            )
            
    try:
        print(f"Received API request for query: {request.query}")
        # Run the full agent pipeline
        result_markdown = orchestrator.process_query(request.query)
        return QueryResponse(response=result_markdown)
    except Exception as e:
        print(f"API Error processing query: {e}")
        return QueryResponse(response="", error=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
