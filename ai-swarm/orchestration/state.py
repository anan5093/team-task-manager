from typing import TypedDict, List, Optional
from datetime import datetime

class AgentState(TypedDict, total=False):
    query: str
    user_id: str
    project_id: str
    task_id: str
    contract_id: str
    jwt_token: str
    context: str  # dashboard, task-assignment, contract-audit
    
    # Processing
    retrieved_data: dict
    analysis: str
    recommendations: List[dict]
    
    # Output
    final_response: str
    confidence: float
    risks: List[dict]
    
    # Metadata
    timestamp: str
    steps_executed: List[str]
    errors: List[str]
