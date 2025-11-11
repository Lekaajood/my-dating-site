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
from datetime import datetime, timezone, timedelta
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
import httpx
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production-min-32-chars')
FACEBOOK_APP_ID = os.environ.get('FACEBOOK_APP_ID', '')
FACEBOOK_APP_SECRET = os.environ.get('FACEBOOK_APP_SECRET', '')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://replyaltobot.online')
BACKEND_URL = os.environ.get('BACKEND_URL', 'https://replyaltobot.online')

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Store states temporarily (use Redis in production)
oauth_states = {}

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    facebook_id: str
    email: Optional[str] = None
    name: str
    picture: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

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
    psid: str
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
    type: str
    content: Dict[str, Any] = {}
    buttons: List[Dict[str, Any]] = []
    next_step_id: Optional[str] = None
    position: Dict[str, float] = {"x": 0, "y": 0}

class Flow(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    page_id: str
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_value: Optional[str] = None
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
    message: Dict[str, Any]
    target_audience: str
    target_tags: List[str] = []
    status: str
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
    type: str
    trigger: Dict[str, Any]
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
    sender: str
    message_type: str
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

# Facebook OAuth Routes
@api_router.get("/auth/facebook/login")
async def facebook_login():
    """Generate Facebook login URL - V2"""
    state = secrets.token_urlsafe(32)
    oauth_states[state] = {"created_at": datetime.now(timezone.utc)}
    
    if not FACEBOOK_APP_ID:
        return {
            "auth_url": None,
            "demo_mode": True,
            "message": "Facebook App ID not configured. Using demo mode."
        }
    
    redirect_uri = f"{BACKEND_URL}/api/auth/facebook/callback"
    # Only request public_profile - basic permission
    facebook_auth_url = f"https://www.facebook.com/v20.0/dialog/oauth?client_id={FACEBOOK_APP_ID}&redirect_uri={redirect_uri}&state={state}&scope=public_profile"
    
    return {"auth_url": facebook_auth_url, "state": state}

@api_router.get("/auth/facebook/callback")
async def facebook_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None):
    """Handle Facebook OAuth callback"""
    
    if error:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error={error}")
    
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=missing_code")
    
    # Validate state
    if state not in oauth_states:
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=invalid_state")
    
    # Exchange code for access token
    token_url = "https://graph.facebook.com/v20.0/oauth/access_token"
    redirect_uri = f"{BACKEND_URL}/api/auth/facebook/callback"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            token_url,
            params={
                "client_id": FACEBOOK_APP_ID,
                "client_secret": FACEBOOK_APP_SECRET,
                "redirect_uri": redirect_uri,
                "code": code
            }
        )
        
        if response.status_code != 200:
            return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=token_exchange_failed")
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=no_access_token")
        
        # Get user info
        user_response = await client.get(
            "https://graph.facebook.com/me",
            params={
                "fields": "id,name,email,picture",
                "access_token": access_token
            }
        )
        
        if user_response.status_code != 200:
            return RedirectResponse(url=f"{FRONTEND_URL}/auth?error=user_info_failed")
        
        user_info = user_response.json()
        
        # Create or update user
        existing_user = await db.users.find_one({"facebook_id": user_info["id"]}, {"_id": 0})
        
        if existing_user:
            user = User(**existing_user)
        else:
            user = User(
                facebook_id=user_info["id"],
                name=user_info.get("name", "Facebook User"),
                email=user_info.get("email"),
                picture=user_info.get("picture", {}).get("data", {}).get("url")
            )
            await db.users.insert_one(user.model_dump())
        
        # Create JWT token
        app_token = create_token(user.id)
        
        # Clean up state
        del oauth_states[state]
        
        return RedirectResponse(url=f"{FRONTEND_URL}/auth?token={app_token}")

@api_router.post("/auth/demo-login")
async def demo_login(name: str):
    """Demo login for testing without Facebook"""
    demo_id = f"demo-{str(uuid.uuid4())[:8]}"
    
    existing_user = await db.users.find_one({"facebook_id": demo_id}, {"_id": 0})
    
    if existing_user:
        user = User(**existing_user)
    else:
        user = User(
            facebook_id=demo_id,
            name=name,
            email=None,
            picture=None
        )
        await db.users.insert_one(user.model_dump())
    
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
    
    query = {"page_id": broadcast["page_id"], "subscribed": True}
    if broadcast["target_audience"] == "tags" and broadcast["target_tags"]:
        query["tags"] = {"$in": broadcast["target_tags"]}
    
    total = await db.subscribers.count_documents(query)
    
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