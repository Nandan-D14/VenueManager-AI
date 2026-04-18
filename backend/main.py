from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

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

class LoginPayload(BaseModel):
    username: str = None
    password: str = None
    role: str
    name: str = None # For Guest
    mobile: str = None # For Admin/Employee
    otp: str = None # For Admin/Employee

# Simple in-memory user store
users_db = {
    "admin": {"username": "admin", "password": "password123", "role": "admin", "mobile": "1234567890"},
    "staff": {"username": "staff", "password": "password123", "role": "employee", "mobile": "0987654321"}
}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].remove(websocket)

    async def broadcast_state(self, session_id: str, state: AgentSession):
        if session_id in self.active_connections:
            state_json = state.model_dump_json() if hasattr(state, 'model_dump_json') else state.json()
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_text(state_json)
                except Exception as e:
                    pass

manager = ConnectionManager()

@app.post("/api/register")
def register(payload: dict):
    role = payload.get("role")
    if role == "guest":
        name = payload.get("name")
        return {"status": "success", "token": f"guest-{name}", "user": name, "role": "guest"}
    
    username = payload.get("username")
    if username in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    
    users_db[username] = payload
    return {"status": "success", "message": "User registered"}

@app.post("/api/login")
def login(payload: LoginPayload):
    role = payload.role
    
    if role == "guest":
        if not payload.name:
            raise HTTPException(status_code=400, detail="Name required for guest login")
        return {"status": "success", "token": f"guest-{payload.name}", "user": payload.name, "role": "guest"}

    # Admin/Employee login
    user = users_db.get(payload.username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    if user["role"] != role:
        raise HTTPException(status_code=401, detail=f"User is not registered as {role}")

    # Simulated OTP/Password check
    # If password is provided, check it. If OTP is provided, treat '1234' as valid
    if payload.password and user.get("password") == payload.password:
        return {"status": "success", "token": f"token-{payload.username}", "user": payload.username, "role": role}
    
    if payload.otp == "1234":
        return {"status": "success", "token": f"token-{payload.username}", "user": payload.username, "role": role}

    raise HTTPException(status_code=401, detail="Invalid credentials or OTP")

@app.post("/api/session/create")
def create_session():
    session_id = agent_service.create_session()
    return {"session_id": session_id}

@app.post("/api/blueprint/generate/{session_id}")
async def generate_blueprint(session_id: str, payload: DnaPayload):
    try:
        plan = agent_service.inject_event_dna(session_id, payload.dna, payload.staff)
        state = agent_service.get_state(session_id)
        await manager.broadcast_state(session_id, state)
        return {
            "plan": plan,
            "phase": state.phase
        }
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")

class ValidationPayload(BaseModel):
    approved: bool

@app.post("/api/blueprint/validate/{session_id}")
async def validate_blueprint(session_id: str, payload: ValidationPayload):
    try:
        message = agent_service.validate_plan(session_id, payload.approved)
        state = agent_service.get_state(session_id)
        await manager.broadcast_state(session_id, state)
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
async def fail_task(session_id: str, task_id: str):
    try:
        agent_service.trigger_task_failure(session_id, task_id)
        state = agent_service.get_state(session_id)
        await manager.broadcast_state(session_id, state)
        return state
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")

class ChatPayload(BaseModel):
    message: str
    session_id: str = None

@app.post("/api/chat")
def guest_chat(payload: ChatPayload):
    from tools.planning_tools import client
    
    # Get Event DNA context if available
    context = ""
    if payload.session_id:
        try:
            state = agent_service.get_state(payload.session_id)
            if state.event_dna:
                context = (
                    f"\nEVENT CONTEXT:\n"
                    f"Name: {state.event_dna.event_type}\n"
                    f"Size: {state.event_dna.venue_size_sqft} sqft\n"
                    f"Guests: {state.event_dna.guest_count} ({state.event_dna.vip_count} VIPs)\n"
                    f"Requirements: {state.event_dna.special_requirements}\n"
                )
        except KeyError:
            pass

    if not client:
        text = payload.message.lower()
        if 'valet' in text: return {"reply": "Valet is at the South Entrance. Wait time is approx 5 mins."}
        if 'bathroom' in text or 'restroom' in text: return {"reply": "Restrooms are down the hall, right of the main stage."}
        if 'schedule' in text: return {"reply": "The keynote address begins in 15 mins at the Main Stage."}
        if 'vip' in text and context: return {"reply": f"We are expecting VIPs today according to our event details."}
        return {"reply": "I have logged your request."}
    
    prompt = f"You are a helpful concierge for this event. Provide a very concise, helpful answer to this guest query: {payload.message}\n{context}"
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"reply": response.text.strip()}
    except Exception as e:
        print(f"Chat error: {e}")
        return {"reply": "I am currently experiencing technical difficulties. Please locate a staff member."}

from models import AdminChatPayload, AdminChatResponseSchema

@app.post("/api/admin/chat/{session_id}", response_model=AdminChatResponseSchema)
async def admin_chat(session_id: str, payload: AdminChatPayload):
    from tools.planning_tools import client
    import base64
    import json
    
    if not client:
        # Fallback simulation
        return {
            "reply": "Simulated AI: I have enough details. Generating plan.",
            "plan_ready": True,
            "extracted_dna": {
                "event_type": "Simulated Event",
                "venue_size_sqft": 50000,
                "guest_count": 500,
                "vip_count": 10,
                "special_requirements": "None"
            }
        }
        
    state = agent_service.get_state(session_id)
    state.admin_chat_history.append({"role": "user", "text": payload.message})
    
    prompt = "You are the VenueMaster AI Logistics Planner. Your goal is to gather event details from the Admin: Event Name/Type, Venue Size (sqft), Guest Count, VIP Count, and Special Requirements. If they upload a 2D map, acknowledge it and factor it into your understanding.\n\n"
    prompt += "Current Chat History:\n"
    for msg in state.admin_chat_history:
        prompt += f"[{msg['role'].upper()}]: {msg['text']}\n"
    prompt += "\nINSTRUCTIONS: If any key information is missing, ask for it and provide 3 to 4 likely options in the `suggested_options` array (e.g. ['Tech Summit', 'Music Festival', 'Corporate Retreat'] for Event Type, or ['500', '1000', '5000'] for size). DO NOT generate tasks yet. Once you confidently have EVENT TYPE, VENUE SIZE, GUEST COUNT, and VIP COUNT, output `plan_ready: true` and fill in the `extracted_dna`. If not ready, output `plan_ready: false`, your next question in `reply`, and the `suggested_options`."
    
    contents = [prompt]
    
    if payload.image_base64:
        try:
            # Format: data:image/png;base64,....
            header, encoded = payload.image_base64.split(",", 1) if "," in payload.image_base64 else ("", payload.image_base64)
            mime_type = header.split(":")[1].split(";")[0] if header else "image/png"
            image_bytes = base64.b64decode(encoded)
            contents.append({
                "mime_type": mime_type,
                "data": image_bytes
            })
        except Exception as e:
            print(f"Failed to decode image: {e}")

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config={
                'response_mime_type': 'application/json',
                'response_schema': AdminChatResponseSchema
            }
        )
        data = json.loads(response.text)
        
        state.admin_chat_history.append({"role": "ai", "text": data.get("reply", "")})
        
        if data.get("plan_ready") and data.get("extracted_dna"):
            # The AI has gathered all DNA! Generate the blueprint.
            dna = EventDNA(**data["extracted_dna"])
            # Default staff for MVP
            staff = [
                StaffMember(employee_id="EMP-001", name="Marcus T.", role="Security", experience_level=5),
                StaffMember(employee_id="EMP-084", name="Sarah K.", role="Valet", experience_level=4),
                StaffMember(employee_id="EMP-102", name="John D.", role="Logistics", experience_level=3)
            ]
            
            plan = agent_service.inject_event_dna(session_id, dna, staff)
            updated_state = agent_service.get_state(session_id)
            await manager.broadcast_state(session_id, updated_state)
            
        return data

    except Exception as e:
        print(f"Admin Chat Error: {e}")
        raise HTTPException(status_code=500, detail="AI processing failed.")

@app.websocket("/api/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    try:
        while True:
            # We don't expect messages from the client in this MVP, just keep connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
