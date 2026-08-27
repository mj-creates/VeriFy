import os
import sys
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, certificates, verify

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Add the agent-core directory to the system path so we can import the orchestrator
current_dir = os.path.dirname(os.path.abspath(__file__))
agent_core_path = os.path.abspath(os.path.join(current_dir, "../agent-core"))
sys.path.append(agent_core_path)

try:
    from orchestrator import VeriFyOrchestrator
except ImportError as e:
    logger.error(f"Error importing orchestrator: {e}")
    logger.error("Ensure the agent-core directory exists and contains orchestrator.py")
    sys.exit(1)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    logger.info("Creating database tables...")
    models.Base.metadata.create_all(bind=engine)

    # Initialize orchestrator
    logger.info("Initializing orchestrator...")
    if not os.getenv("GROQ_API_KEY") or not os.getenv("TAVILY_API_KEY"):
        logger.warning("GROQ_API_KEY or TAVILY_API_KEY is missing. Agent core won't work!")

    try:
        app.state.orchestrator = VeriFyOrchestrator()
        logger.info("Successfully initialized VeriFy Orchestrator.")
    except Exception as e:
        logger.warning(f"Orchestrator failed to initialize on startup: {e}")
        logger.warning("Please ensure GROQ_API_KEY is set in your environment variables.")
        app.state.orchestrator = None

    yield
    # Clean up can happen here
    logger.info("Shutting down...")

app = FastAPI(
    title="VeriFy API",
    description="Backend for the VeriFy AI Agent System",
    lifespan=lifespan
)

# Enable CORS so the frontend (React/Vue/etc.) can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # NOTE: For production, change this to your specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(certificates.router, prefix="/api")
app.include_router(verify.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "VeriFy API is running.",
        "orchestrator_ready": getattr(app.state, "orchestrator", None) is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
