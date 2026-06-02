import sys
import os
from pathlib import Path

# Add parent directory to path to import sibling packages
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from config import settings
from orchestration.graph_builder import orchestrator
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Team Task Manager - AI Swarm",
    description="Multi-agent orchestration",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class QueryRequest(BaseModel):
    query: str
    project_id: str = None
    contract_id: str = None
    user_id: str
    context: str = "dashboard"

class QueryResponse(BaseModel):
    success: bool
    response: str
    analysis: str = ""
    recommendations: str = ""
    confidence: float
    execution_trace: list
    errors: list

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ai-swarm"}

@app.post("/api/swarm/query", response_model=QueryResponse)
async def process_query(
    request: QueryRequest,
    authorization: str = Header(None)
):
    """Process query through swarm"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth")
    
    jwt_token = authorization.split(" ")[1]
    
    try:
        result = await orchestrator.invoke(
            query=request.query,
            user_id=request.user_id,
            jwt_token=jwt_token,
            project_id=request.project_id,
            contract_id=request.contract_id,
            context=request.context
        )
        
        return QueryResponse(
            success=True,
            response=result['final_response'],
            analysis=result.get('analysis', ''),
            recommendations=result.get('recommendations', ''),
            confidence=result.get('confidence', 0.0),
            execution_trace=result.get('steps_executed', []),
            errors=result.get('errors', [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.FASTAPI_PORT)
