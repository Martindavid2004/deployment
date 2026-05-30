# codoAI Backend (FastAPI + MongoDB Atlas)

This is the backend service for **codoAI**, built with FastAPI and MongoDB Atlas.

## Features

- FastAPI async backend
- MongoDB Atlas integration via `motor`
- JWT-based authentication (login/register)
- Admin & user roles
- Problems CRUD API
- Attempts tracking (round state, timers, completion)
- Leaderboard per problem
- **Competitive Mode** with multiple game types:
  - **Code Sprint**: Race to solve problems fastest
  - **🐛 Bug Hunt**: Find and fix bugs in code
  - **Code Shuffle**: Rearrange shuffled code lines
  - **Test Master**: Create comprehensive test cases
  - **🤖 AI-Generated Problems**: All competitive matches use randomly generated problems
  - **Multiplayer Lobbies**: Up to 15 players per match with unique Game IDs
- XP/level/achievements ready (to be computed by frontend or future backend logic)
- CORS enabled for `http://localhost:5173`
- Dockerfile + docker-compose template
- Postman collection for testing

## Setup

### 1. Clone & install

```bash
pip install -r requirements.txt
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill:

```bash
cp .env.example .env
```

Edit `.env`:

- `MONGODB_URI` → your MongoDB Atlas connection string
- `JWT_SECRET` → any strong random string

### 3. Run locally

```bash
uvicorn app.main:app --reload
```

API docs:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 4. Docker (optional)

```bash
docker build -t codoai-backend .
docker run -p 8000:8000 --env-file .env codoai-backend
```

## Postman

Use the included collections in `postman/`:
- `codoai-backend.postman_collection.json` - General API testing
- `competitive-mode.postman_collection.json` - Competitive mode testing

Test endpoints:
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `GET /problems`
- `POST /problems` (admin only)
- `POST /attempts`
- `GET /leaderboard/problem/{problem_id}`
- `POST /competitive/matches` - Create competitive match
- `GET /competitive/matches/{match_id}` - Get match details
- `POST /competitive/matches/{match_id}/submit` - Submit solution

## Game Modes

All competitive game modes now use **AI-generated problems** for each match! Every game is unique and tailored to provide the best competitive experience.

### 🤖 AI Problem Generation
### 🔀 Code Shuffle Mode
Players arrange shuffled code lines into the correct order using drag-and-drop or arrow buttons. Tests code comprehension and logical thinking.

### ⚡ Code Sprint Mode
Classic competitive programming - solve problems from scratch as fast as possible.

### 🎯 Test Master Mode
Create comprehensive test cases for a given problem. Quality and edge case coverage determine your score.

### 🎮 Multiplayer Lobbies
- Up to 15 players per match
- Unique 6-character Game IDs for easy joining
- Real-time player list updates
- Host controls when game starts

**Documentation:**
- 📘 [Code Shuffle Guide](CODE_SHUFFLE_GUIDE.md) - Complete guide with strategies
- 🎨 [Visual Demo](CODE_SHUFFLE_VISUAL_DEMO.md) - See how it looks and works
- ⚙️ [Implementation Details](CODE_SHUFFLE_IMPLEMENTATION.md) - Technical documentation
- 🔧 [Troubleshooting](CODE_SHUFFLE_FIX.md) - Fix common issues
- 🎮 [Multiplayer Quick Start](MULTIPLAYER_QUICKSTART.md) - Get started with multiplayer
- 🔧 [Lobby Join Troubleshooting](LOBBY_JOIN_TROUBLESHOOTING.md) - Fix lobby join issues

For other game modes, see [COMPETITIVE_MODE.md](COMPETITIVE_MODE.md)

## Running the Backend

Standard command:
```bash
uvicorn app.main:app --reload
```

From workspace root with virtual environment:
```bash
cd PROEDUVATE-CODEING-MODULE; ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

## Testing

### Test Lobby Join Functionality
If players cannot join lobbies, run the diagnostic script:

```bash
python test_lobby_join.py
```

This will:
- Test authentication
- Create a lobby
- Test joining the lobby
- Verify multiplayer functionality
- Provide detailed error diagnosis

See [LOBBY_JOIN_TROUBLESHOOTING.md](LOBBY_JOIN_TROUBLESHOOTING.md) for common issues.