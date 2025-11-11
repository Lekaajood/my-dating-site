#!/usr/bin/env python3
"""
Seed demo data for ChatFlow application
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
import uuid

async def seed_demo_data():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🌱 Seeding demo data...")
    
    # Check if there's already data
    user_count = await db.users.count_documents({})
    if user_count > 0:
        print("⚠️  Data already exists. Skipping seed.")
        return
    
    # Create demo subscribers
    page_id = "demo-page-1"
    subscribers = [
        {
            "id": str(uuid.uuid4()),
            "page_id": page_id,
            "user_id": "demo-user",
            "psid": f"1234567890{i}",
            "first_name": ["أحمد", "فاطمة", "محمد", "سارة", "علي", "نور", "خالد", "ليلى"][i % 8],
            "last_name": ["العلي", "الحسن", "الشمري", "القحطاني", "الدوسري", "الزهراني", "المطيري", "العمري"][i % 8],
            "profile_pic": None,
            "tags": [],
            "subscribed": True,
            "last_interaction": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        for i in range(15)
    ]
    
    # Add some tags to random subscribers
    subscribers[0]["tags"] = ["vip", "interested"]
    subscribers[3]["tags"] = ["new_customer"]
    subscribers[7]["tags"] = ["returning"]
    
    await db.subscribers.insert_many(subscribers)
    print(f"✅ Created {len(subscribers)} demo subscribers")
    
    print("🎉 Demo data seeded successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_demo_data())
