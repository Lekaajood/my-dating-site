from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from passlib.context import CryptContext
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class FacebookPage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    page_id: str
    page_name: str
    page_avatar: Optional[str] = None
    access_token: Optional[str] = None
    is_connected: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FacebookPageCreate(BaseModel):
    page_id: str
    page_name: str
    page_avatar: Optional[str] = None
    access_token: Optional[str] = None

class Subscriber(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_id: str
    user_id: str
    psid: str  # Page-scoped ID from Facebook
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_pic: Optional[str] = None
    tags: List[str] = []
    subscribed: bool = True
    last_interaction: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SubscriberCreate(BaseModel):
    page_id: str
    psid: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_pic: Optional[str] = None

class FlowStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # message, card, delay, condition
    content: Dict[str, Any] = {}  # message text, card data, delay time, etc
    buttons: List[Dict[str, Any]] = []  # buttons for cards/messages
    next_step_id: Optional[str] = None
    position: Dict[str, float] = {"x": 0, "y": 0}

class Flow(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    page_id: str
    name: str
    description: Optional[str] = None
    trigger_type: str  # welcome, keyword, comment, manual
    trigger_value: Optional[str] = None  # keyword or comment text
    steps: List[FlowStep] = []
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FlowCreate(BaseModel):
    page_id: str
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_value: Optional[str] = None

class FlowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_value: Optional[str] = None
    steps: Optional[List[FlowStep]] = None
    is_active: Optional[bool] = None

class Broadcast(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    page_id: str
    name: str
    message: Dict[str, Any]  # message content with text, cards, buttons
    target_audience: str  # all, tags
    target_tags: List[str] = []
    status: str  # draft, scheduled, sent, sending
    scheduled_at: Optional[str] = None
    sent_at: Optional[str] = None
    total_recipients: int = 0
    sent_count: int = 0
    delivered_count: int = 0
    read_count: int = 0
    clicked_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BroadcastCreate(BaseModel):
    page_id: str
    name: str
    message: Dict[str, Any]
    target_audience: str = "all"
    target_tags: List[str] = []
    scheduled_at: Optional[str] = None

class Automation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    page_id: str
    name: str
    type: str  # comment_to_message, welcome_message, keyword
    trigger: Dict[str, Any]  # trigger configuration
    flow_id: Optional[str] = None
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AutomationCreate(BaseModel):
    page_id: str
    name: str
    type: str
    trigger: Dict[str, Any]
    flow_id: Optional[str] = None

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_id: str
    subscriber_id: str
    sender: str  # user or subscriber
    message_type: str  # text, card, button_click
    content: Dict[str, Any]
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MessageCreate(BaseModel):
    page_id: str
    subscriber_id: str
    sender: str
    message_type: str
    content: Dict[str, Any]

class Stats(BaseModel):
    total_subscribers: int
    active_subscribers: int
    total_messages: int
    total_broadcasts: int
    total_flows: int

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_token(user_id: str):
    payload = {"user_id": user_id, "exp": datetime.now(timezone.utc).timestamp() + 86400 * 30}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["user_id"]
    except:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# Routes
@api_router.post("/auth/register")
async def register(input: UserCreate):
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    user = User(email=input.email, name=input.name)
    doc = user.model_dump()
    doc["password"] = get_password_hash(input.password)
    await db.users.insert_one(doc)
    
    token = create_token(user.id)
    return {"user": user, "token": token}

@api_router.post("/auth/login")
async def login(input: UserLogin):
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc or not verify_password(input.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_doc)
    token = create_token(user.id)
    return {"user": user, "token": token}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Facebook Pages
@api_router.post("/pages", response_model=FacebookPage)
async def create_page(input: FacebookPageCreate, current_user: User = Depends(get_current_user)):
    page = FacebookPage(user_id=current_user.id, **input.model_dump())
    doc = page.model_dump()
    await db.facebook_pages.insert_one(doc)
    return page

@api_router.get("/pages", response_model=List[FacebookPage])
async def get_pages(current_user: User = Depends(get_current_user)):
    pages = await db.facebook_pages.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    return pages

@api_router.delete("/pages/{page_id}")
async def delete_page(page_id: str, current_user: User = Depends(get_current_user)):
    result = await db.facebook_pages.delete_one({"id": page_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"success": True}

# Subscribers
@api_router.post("/subscribers", response_model=Subscriber)
async def create_subscriber(input: SubscriberCreate, current_user: User = Depends(get_current_user)):
    subscriber = Subscriber(user_id=current_user.id, **input.model_dump())
    doc = subscriber.model_dump()
    await db.subscribers.insert_one(doc)
    return subscriber

@api_router.get("/subscribers", response_model=List[Subscriber])
async def get_subscribers(page_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"user_id": current_user.id}
    if page_id:
        query["page_id"] = page_id
    subscribers = await db.subscribers.find(query, {"_id": 0}).to_list(10000)
    return subscribers

@api_router.get("/subscribers/{subscriber_id}", response_model=Subscriber)
async def get_subscriber(subscriber_id: str, current_user: User = Depends(get_current_user)):
    subscriber = await db.subscribers.find_one({"id": subscriber_id, "user_id": current_user.id}, {"_id": 0})
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return Subscriber(**subscriber)

@api_router.patch("/subscribers/{subscriber_id}")
async def update_subscriber(subscriber_id: str, tags: List[str], current_user: User = Depends(get_current_user)):
    result = await db.subscribers.update_one(
        {"id": subscriber_id, "user_id": current_user.id},
        {"$set": {"tags": tags}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return {"success": True}

# Flows
@api_router.post("/flows", response_model=Flow)
async def create_flow(input: FlowCreate, current_user: User = Depends(get_current_user)):
    flow = Flow(user_id=current_user.id, **input.model_dump())
    doc = flow.model_dump()
    await db.flows.insert_one(doc)
    return flow

@api_router.get("/flows", response_model=List[Flow])
async def get_flows(page_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"user_id": current_user.id}
    if page_id:
        query["page_id"] = page_id
    flows = await db.flows.find(query, {"_id": 0}).to_list(1000)
    return flows

@api_router.get("/flows/{flow_id}", response_model=Flow)
async def get_flow(flow_id: str, current_user: User = Depends(get_current_user)):
    flow = await db.flows.find_one({"id": flow_id, "user_id": current_user.id}, {"_id": 0})
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    return Flow(**flow)

@api_router.patch("/flows/{flow_id}", response_model=Flow)
async def update_flow(flow_id: str, input: FlowUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.flows.update_one(
        {"id": flow_id, "user_id": current_user.id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    flow = await db.flows.find_one({"id": flow_id}, {"_id": 0})
    return Flow(**flow)

@api_router.delete("/flows/{flow_id}")
async def delete_flow(flow_id: str, current_user: User = Depends(get_current_user)):
    result = await db.flows.delete_one({"id": flow_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flow not found")
    return {"success": True}

# Broadcasts
@api_router.post("/broadcasts", response_model=Broadcast)
async def create_broadcast(input: BroadcastCreate, current_user: User = Depends(get_current_user)):
    broadcast = Broadcast(user_id=current_user.id, status="draft", **input.model_dump())
    doc = broadcast.model_dump()
    await db.broadcasts.insert_one(doc)
    return broadcast

@api_router.get("/broadcasts", response_model=List[Broadcast])
async def get_broadcasts(page_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"user_id": current_user.id}
    if page_id:
        query["page_id"] = page_id
    broadcasts = await db.broadcasts.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return broadcasts

@api_router.get("/broadcasts/{broadcast_id}", response_model=Broadcast)
async def get_broadcast(broadcast_id: str, current_user: User = Depends(get_current_user)):
    broadcast = await db.broadcasts.find_one({"id": broadcast_id, "user_id": current_user.id}, {"_id": 0})
    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found")
    return Broadcast(**broadcast)

@api_router.post("/broadcasts/{broadcast_id}/send")
async def send_broadcast(broadcast_id: str, current_user: User = Depends(get_current_user)):
    broadcast = await db.broadcasts.find_one({"id": broadcast_id, "user_id": current_user.id}, {"_id": 0})
    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found")
    
    # Get subscribers count
    query = {"page_id": broadcast["page_id"], "subscribed": True}
    if broadcast["target_audience"] == "tags" and broadcast["target_tags"]:
        query["tags"] = {"$in": broadcast["target_tags"]}
    
    total = await db.subscribers.count_documents(query)
    
    # Update broadcast status
    await db.broadcasts.update_one(
        {"id": broadcast_id},
        {"$set": {
            "status": "sent",
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "total_recipients": total,
            "sent_count": total,
            "delivered_count": total
        }}
    )
    
    return {"success": True, "total_recipients": total}

@api_router.delete("/broadcasts/{broadcast_id}")
async def delete_broadcast(broadcast_id: str, current_user: User = Depends(get_current_user)):
    result = await db.broadcasts.delete_one({"id": broadcast_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Broadcast not found")
    return {"success": True}

# Automations
@api_router.post("/automations", response_model=Automation)
async def create_automation(input: AutomationCreate, current_user: User = Depends(get_current_user)):
    automation = Automation(user_id=current_user.id, **input.model_dump())
    doc = automation.model_dump()
    await db.automations.insert_one(doc)
    return automation

@api_router.get("/automations", response_model=List[Automation])
async def get_automations(page_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"user_id": current_user.id}
    if page_id:
        query["page_id"] = page_id
    automations = await db.automations.find(query, {"_id": 0}).to_list(1000)
    return automations

@api_router.patch("/automations/{automation_id}")
async def toggle_automation(automation_id: str, is_active: bool, current_user: User = Depends(get_current_user)):
    result = await db.automations.update_one(
        {"id": automation_id, "user_id": current_user.id},
        {"$set": {"is_active": is_active}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Automation not found")
    return {"success": True}

@api_router.delete("/automations/{automation_id}")
async def delete_automation(automation_id: str, current_user: User = Depends(get_current_user)):
    result = await db.automations.delete_one({"id": automation_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Automation not found")
    return {"success": True}

# Messages
@api_router.post("/messages", response_model=Message)
async def create_message(input: MessageCreate, current_user: User = Depends(get_current_user)):
    message = Message(**input.model_dump())
    doc = message.model_dump()
    await db.messages.insert_one(doc)
    return message

@api_router.get("/messages")
async def get_messages(subscriber_id: str, current_user: User = Depends(get_current_user)):
    messages = await db.messages.find({"subscriber_id": subscriber_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return messages

# Stats
@api_router.get("/stats", response_model=Stats)
async def get_stats(page_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"user_id": current_user.id}
    if page_id:
        query["page_id"] = page_id
    
    total_subscribers = await db.subscribers.count_documents(query)
    active_subscribers = await db.subscribers.count_documents({**query, "subscribed": True})
    total_messages = await db.messages.count_documents({"page_id": page_id} if page_id else {})
    total_broadcasts = await db.broadcasts.count_documents(query)
    total_flows = await db.flows.count_documents(query)
    
    return Stats(
        total_subscribers=total_subscribers,
        active_subscribers=active_subscribers,
        total_messages=total_messages,
        total_broadcasts=total_broadcasts,
        total_flows=total_flows
    )

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()