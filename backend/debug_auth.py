#!/usr/bin/env python3
"""
Debug script to check authentication issues

Run this to:
1. List all users in the database
2. Test login with specific credentials
3. Create a test user if needed
"""

import asyncio
import sys
from app.db.mongo import get_database
from app.security.auth import hash_password, verify_password

async def list_users():
    """List all users in the database"""
    print("\n" + "="*60)
    print("📋 Users in Database")
    print("="*60)
    
    try:
        db = get_database()
        users = []
        
        async for user in db.users.find():
            users.append(user)
        
        if not users:
            print("❌ No users found in database!")
            print("   Create a user by registering through the frontend")
            return False
        
        print(f"\nFound {len(users)} user(s):\n")
        
        for i, user in enumerate(users, 1):
            print(f"{i}. Username: {user.get('username')}")
            print(f"   Email: {user.get('email')}")
            print(f"   Is Admin: {user.get('is_admin', False)}")
            print(f"   XP: {user.get('xp', 0)}")
            print(f"   Level: {user.get('level', 1)}")
            print()
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def test_login(username: str, password: str):
    """Test login with specific credentials"""
    print("\n" + "="*60)
    print(f"🔐 Testing Login for: {username}")
    print("="*60)
    
    try:
        db = get_database()
        
        # Find user
        user = await db.users.find_one({"username": username})
        
        if not user:
            print(f"❌ User '{username}' not found in database!")
            print("   Available users:")
            async for u in db.users.find():
                print(f"   - {u.get('username')}")
            return False
        
        print(f"✅ User found: {username}")
        print(f"   Email: {user.get('email')}")
        
        # Check password
        hashed = user.get('hashed_password')
        is_valid = verify_password(password, hashed)
        
        if is_valid:
            print(f"✅ Password is CORRECT!")
            print(f"   Login should work with:")
            print(f"   Username: {username}")
            print(f"   Password: {password}")
            return True
        else:
            print(f"❌ Password is INCORRECT!")
            print(f"   The password you provided doesn't match the database")
            return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def create_test_user(username: str, password: str, email: str = None):
    """Create a test user"""
    print("\n" + "="*60)
    print(f"➕ Creating Test User: {username}")
    print("="*60)
    
    try:
        db = get_database()
        
        # Check if user exists
        existing = await db.users.find_one({"username": username})
        if existing:
            print(f"❌ User '{username}' already exists!")
            return False
        
        # Create user
        email = email or f"{username}@test.com"
        doc = {
            "username": username,
            "email": email.lower(),
            "hashed_password": hash_password(password),
            "preferred_language": "python",
            "is_admin": username.lower() == "admin",
            "xp": 0,
            "level": 1,
            "achievements": [],
            "rating": 1200,
            "friends": [],
            "friend_requests": [],
            "match_invites": [],
            "learning_xp": 0,
            "competitive_xp": 0,
            "learning_level": 1,
            "competitive_level": 1,
        }
        
        result = await db.users.insert_one(doc)
        
        print(f"✅ User created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   User ID: {result.inserted_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    """Main function"""
    print("\n🔍 Authentication Debug Tool\n")
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python debug_auth.py list                           # List all users")
        print("  python debug_auth.py test <username> <password>     # Test login")
        print("  python debug_auth.py create <username> <password>   # Create test user")
        print("\nExamples:")
        print("  python debug_auth.py list")
        print("  python debug_auth.py test admin admin123")
        print("  python debug_auth.py create testuser password123")
        return
    
    command = sys.argv[1].lower()
    
    if command == "list":
        await list_users()
    
    elif command == "test":
        if len(sys.argv) < 4:
            print("❌ Usage: python debug_auth.py test <username> <password>")
            return
        
        username = sys.argv[2]
        password = sys.argv[3]
        await test_login(username, password)
    
    elif command == "create":
        if len(sys.argv) < 4:
            print("❌ Usage: python debug_auth.py create <username> <password> [email]")
            return
        
        username = sys.argv[2]
        password = sys.argv[3]
        email = sys.argv[4] if len(sys.argv) > 4 else None
        await create_test_user(username, password, email)
    
    else:
        print(f"❌ Unknown command: {command}")
        print("   Valid commands: list, test, create")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
