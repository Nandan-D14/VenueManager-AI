from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from models import EventDNA, StaffMember, AgentSession
from agent_engine import agent_service

app = FastAPI(title="VenueManager-AI Backend")

# Allow CORS for local React dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DnaPayload(BaseModel):
    dna: EventDNA
    staff: List[StaffMember]

@app.post("/api/session/create")
def create_session():
    session_id = agent_service.create_session()
    return {"session_id": session_id}

@app.post("/api/blueprint/generate/{session_id}")
def generate_blueprint(session_id: str, payload: DnaPayload):
    try:
        plan = agent_service.inject_event_dna(session_id, payload.dna, payload.staff)
        state = agent_service.get_state(session_id)
        return {
            "plan": plan,
            "phase": state.phase
        }
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")

class ValidationPayload(BaseModel):
    approved: bool

@app.post("/api/blueprint/validate/{session_id}")
def validate_blueprint(session_id: str, payload: ValidationPayload):
    try:
        message = agent_service.validate_plan(session_id, payload.approved)
        state = agent_service.get_state(session_id)
        return {"message": message, "phase": state.phase}
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")

@app.get("/api/state/{session_id}")
def get_state(session_id: str):
    try:
        return agent_service.get_state(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")

@app.post("/api/tasks/{session_id}/{task_id}/fail")
def fail_task(session_id: str, task_id: str):
    try:
        agent_service.trigger_task_failure(session_id, task_id)
        return agent_service.get_state(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
