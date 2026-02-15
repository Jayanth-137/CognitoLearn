# CognitoLearn Backend

A modular monolith backend API for the CognitoLearn learning platform.

## Project Structure

```
CognitoLearn/
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js        # Entry point
│       ├── config/         # Configuration
│       ├── middleware/     # Auth middleware
│       ├── models/         # Mongoose models
│       ├── controllers/    # Business logic
│       └── routes/         # API routes
└── ai-service/             # Python AI service
    ├── requirements.txt
    └── main.py
```

## Quick Start

### 1. Install Dependencies

```bash
# Server
cd server
npm install

# AI Service
cd ../ai-service
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your settings
```

### 3. Start MongoDB

Make sure MongoDB is running on `mongodb://localhost:27017`

### 4. Run the Application

```bash
# Terminal 1 - Node.js Server
cd server
npm run dev

# Terminal 2 - AI Service (optional)
cd ai-service
python main.py
```

The server runs on `http://localhost:3000`

## API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/verify` | Verify token |

### Users (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |

### Quizzes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes` | Get all quizzes |
| GET | `/api/quizzes/:id` | Get quiz by ID |
| POST | `/api/quizzes/:id/attempt` | Submit attempt |
| GET | `/api/quizzes/attempts` | Get attempts |

### Roadmaps (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/roadmaps/generate` | Generate from prompt |
| GET | `/api/roadmaps` | Get user's roadmaps |
| PUT | `/api/roadmaps/:id` | Update progress |
| DELETE | `/api/roadmaps/:id` | Delete roadmap |

### Analytics (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/progress` | Learning progress |
| POST | `/api/analytics/activity` | Log activity |
| GET | `/api/analytics/streaks` | Get streaks |

### AI Service (Port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/ai/mentor/chat` | Chat with AI |
| POST | `/api/ai/summarize` | Summarize text |

## Authentication

- **Access Token**: 15min expiry, `Authorization: Bearer <token>`
- **Refresh Token**: 7 days, HTTP-only cookie

## Cleanup

You can delete the old microservice folders:
- `server/shared/`
- `server/gateway/`
- `server/auth-service/`
- `server/user-service/`
- `server/quiz-service/`
- `server/roadmap-service/`
- `server/analytics-service/`
- `server/ai-service/`
