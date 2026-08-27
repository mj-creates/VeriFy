import logging
from fastapi import APIRouter, HTTPException, Request
import schemas

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/verify", tags=["verify"])

@router.post("", response_model=schemas.QueryResponse)
def verify_claim(request: schemas.QueryRequest, req: Request):
    # Access the global orchestrator from the app state
    orchestrator = req.app.state.orchestrator

    if not orchestrator:
        raise HTTPException(
            status_code=500,
            detail="Orchestrator not ready. Ensure GROQ_API_KEY is set."
        )

    try:
        logger.info(f"Received API request for query: {request.query}")
        # Run the full agent pipeline
        result_dict = orchestrator.process_query(request.query)
        return schemas.QueryResponse(response=result_dict)
    except Exception as e:
        logger.exception(f"API Error processing query: {e}")
        return schemas.QueryResponse(response=None, error=str(e))
