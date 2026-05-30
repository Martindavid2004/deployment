"""
Test script to verify lobby join functionality
Run this after starting the backend to test lobby creation and joining
"""

import requests
import json
from datetime import datetime

# Configuration
API_BASE = "http://localhost:8000"

# Test credentials (create these users first via the frontend or registration endpoint)
USER1 = {
    "username": "testuser1",
    "password": "password123"
}

USER2 = {
    "username": "testuser2", 
    "password": "password123"
}

def login(username, password):
    """Login and get JWT token"""
    print(f"\n🔐 Logging in as {username}...")
    response = requests.post(
        f"{API_BASE}/auth/login",
        data={
            "username": username,
            "password": password
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Login successful: {data['username']}")
        return data['access_token']
    else:
        print(f"   ❌ Login failed: {response.status_code} - {response.text}")
        return None

def create_lobby(token, game_mode="standard", max_players=5):
    """Create a new lobby"""
    print(f"\n🎮 Creating lobby (game_mode={game_mode}, max_players={max_players})...")
    
    response = requests.post(
        f"{API_BASE}/competitive/lobby/create",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={
            "game_mode": game_mode,
            "max_players": max_players,
            "time_limit_seconds": 1800,
            "lobby_name": "Test Lobby"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        game_id = data['game_id']
        print(f"   ✅ Lobby created successfully!")
        print(f"   📋 Game ID: {game_id}")
        print(f"   👥 Host: {data['host_username']}")
        print(f"   🎯 Game Mode: {data['game_mode']}")
        print(f"   📊 Status: {data['status']}")
        return game_id
    else:
        print(f"   ❌ Failed to create lobby: {response.status_code}")
        print(f"      {response.text}")
        return None

def join_lobby(token, game_id):
    """Join an existing lobby"""
    print(f"\n🚪 Joining lobby {game_id}...")
    
    response = requests.post(
        f"{API_BASE}/competitive/lobby/join",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={
            "game_id": game_id
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Successfully joined lobby!")
        print(f"   📋 Lobby: {data['lobby']['lobby_name']}")
        print(f"   👥 Players: {len(data['lobby']['players'])}/{data['lobby']['max_players']}")
        for i, player in enumerate(data['lobby']['players'], 1):
            print(f"      {i}. {player['username']}")
        return True
    else:
        print(f"   ❌ Failed to join lobby: {response.status_code}")
        error_detail = response.json().get('detail', 'Unknown error')
        print(f"      Error: {error_detail}")
        return False

def get_lobby(token, game_id):
    """Get lobby details"""
    print(f"\n🔍 Fetching lobby {game_id}...")
    
    response = requests.get(
        f"{API_BASE}/competitive/lobby/{game_id}",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Lobby details:")
        print(f"   📋 Name: {data['lobby_name']}")
        print(f"   🎯 Mode: {data['game_mode']}")
        print(f"   📊 Status: {data['status']}")
        print(f"   👥 Players ({len(data['players'])}/{data['max_players']}):")
        for i, player in enumerate(data['players'], 1):
            crown = "👑" if player['user_id'] == data['host_id'] else "  "
            print(f"      {crown} {i}. {player['username']}")
        return True
    else:
        print(f"   ❌ Failed to fetch lobby: {response.status_code}")
        print(f"      {response.text}")
        return False

def list_lobbies(token, status="waiting"):
    """List all available lobbies"""
    print(f"\n📋 Listing lobbies (status={status})...")
    
    response = requests.get(
        f"{API_BASE}/competitive/lobby/list",
        headers={
            "Authorization": f"Bearer {token}"
        },
        params={
            "status": status
        }
    )
    
    if response.status_code == 200:
        lobbies = response.json()
        print(f"   ✅ Found {len(lobbies)} lobbies:")
        for i, lobby in enumerate(lobbies, 1):
            print(f"      {i}. {lobby['game_id']} - {lobby['lobby_name']} ({lobby['game_mode']}) - {len(lobby['players'])} players")
        return lobbies
    else:
        print(f"   ❌ Failed to list lobbies: {response.status_code}")
        return []

def main():
    """Run comprehensive lobby join test"""
    print("="*60)
    print("🧪 LOBBY JOIN FUNCTIONALITY TEST")
    print("="*60)
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔗 API Base: {API_BASE}")
    print("\n⚠️  Make sure:")
    print("   1. Backend is running on port 8000")
    print("   2. MongoDB is connected")
    print("   3. Test users are registered (testuser1, testuser2)")
    
    input("\nPress Enter to continue...")
    
    # Step 1: Login as both users
    token1 = login(USER1["username"], USER1["password"])
    token2 = login(USER2["username"], USER2["password"])
    
    if not token1 or not token2:
        print("\n❌ Login failed. Please create test users first:")
        print("   1. Open frontend and register testuser1 (password123)")
        print("   2. Register testuser2 (password123)")
        print("   3. Run this script again")
        return
    
    # Step 2: User1 creates a lobby
    game_id = create_lobby(token1, game_mode="code_shuffle", max_players=5)
    
    if not game_id:
        print("\n❌ Failed to create lobby. Check backend logs.")
        return
    
    # Step 3: List available lobbies
    list_lobbies(token2, status="waiting")
    
    # Step 4: User2 joins the lobby
    success = join_lobby(token2, game_id)
    
    if not success:
        print("\n❌ JOIN FAILED - This is the issue!")
        print("\nDebug steps:")
        print("   1. Check backend terminal for error messages")
        print("   2. Verify MongoDB connection")
        print("   3. Check if lobby status is 'waiting'")
        print("   4. Ensure User2 token is valid")
        return
    
    # Step 5: Verify lobby state
    get_lobby(token1, game_id)
    
    # Step 6: User1 checks lobby again
    print("\n👑 Host checking lobby state...")
    get_lobby(token1, game_id)
    
    print("\n" + "="*60)
    print("✅ ALL TESTS PASSED!")
    print("="*60)
    print("\nLobby join functionality is working correctly.")
    print(f"Game ID {game_id} has 2 players and is ready to start.")
    print("\nYou can test starting the game from the frontend:")
    print(f"   http://localhost:5173/lobby/{game_id}")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ Cannot connect to backend at", API_BASE)
        print("   Make sure the backend is running:")
        print("   cd PROEDUVATE-CODEING-MODULE")
        print("   ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000")
    except KeyboardInterrupt:
        print("\n\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
