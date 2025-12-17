# @biblemind/api

**BibleMind REST API Server**

REST API for the BibleMind Biblical Holographic Reasoning Engine. Provides endpoints for asking biblical questions, tracking user history, and analyzing discipleship growth.

## Features

- ✅ **Biblical Question Analysis**: Process questions through 10 parallel reasoning engines
- ✅ **Firebase Authentication**: Secure user authentication and authorization
- ✅ **Rate Limiting**: Free tier (10 questions/day), Premium tier (unlimited)
- ✅ **User Context Management**: Personalized responses based on denomination, theological lean, preferences
- ✅ **Question History**: Track and retrieve past questions and guidance
- ✅ **Discipleship Growth Tracking**: Analyze spiritual maturity indicators over time
- ✅ **Error Handling**: Comprehensive error handling and validation
- ✅ **CORS & Security**: Helmet, CORS, rate limiting

## Tech Stack

- **Framework**: Express.js + TypeScript
- **Authentication**: Firebase Admin SDK
- **Reasoning Engine**: @biblemind/engines (10-engine holographic system)
- **AI**: OpenAI GPT-4 Turbo
- **Database**: Firestore
- **Validation**: Zod

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_CLIENT_EMAIL`: Firebase service account email
- `FIREBASE_PRIVATE_KEY`: Firebase service account private key

### 3. Set Up Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Authentication (Email/Password, Google, etc.)
4. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Copy values to `.env`

### 4. Initialize Firestore Structure

Create these collections in Firestore:

```
users/
  {userId}/
    - email: string
    - subscriptionStatus: 'free' | 'active'
    - denomination: string (optional)
    - theologicalLean: string (optional)
    - preferences: object
    - createdAt: timestamp
    - updatedAt: timestamp

    questions/
      {questionId}/
        - question: string
        - result: object (BiblicalReasoning)
        - timestamp: timestamp
        - processingTimeMs: number
        - outcome: string (optional, filled in later)
```

### 5. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### 6. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Public Endpoints

#### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "BibleMind API",
  "version": "0.1.0",
  "timestamp": "2024-02-01T12:00:00.000Z"
}
```

#### `GET /`

Root endpoint with API documentation.

### Authenticated Endpoints

All authenticated endpoints require a Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

#### `POST /api/v1/ask`

Ask a biblical question through the 10-engine holographic reasoning system.

**Request Body:**
```json
{
  "question": "How do I forgive someone who hurt me deeply?",
  "userContext": {
    "denomination": "protestant",
    "theologicalLean": "reformed",
    "preferences": {
      "showHebrewGreek": true,
      "enableCrossReferences": true,
      "preferredTranslation": "ESV"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "status": "complete",
    "question": "How do I forgive someone who hurt me deeply?",
    "synthesis": "# Biblical Guidance on Forgiveness\n\n[Full markdown response...]",
    "confidence": 92,
    "reasoning": {
      "engine0": { "status": "CLEAR", "confidence": 95 },
      "engine1": [ /* 7 theological perspectives */ ],
      "engine2": { /* covenant analysis */ },
      "engine3": { /* tribunal verdict */ },
      "engine4": { /* pastoral risk analysis */ },
      "engine5": { /* cross-testament integration */ },
      "engine6": { /* synthesis */ },
      "engine7": { /* memory recall */ },
      "engine9": { /* affect analysis */ }
    },
    "scriptures": [
      {
        "reference": "Ephesians 4:32",
        "text": "Be kind to one another, tenderhearted, forgiving one another...",
        "translation": "ESV",
        "testament": "new",
        "book": "Ephesians",
        "chapter": 4,
        "verse": 32,
        "context": "Foundation for Christian forgiveness"
      }
    ],
    "processingTimeMs": 8542
  },
  "questionsRemaining": "unlimited" // or number for free tier
}
```

**Rate Limits:**
- Free tier: 10 requests per 24 hours
- Premium tier: 1000 requests per hour

#### `GET /api/v1/history`

Get user's question history.

**Query Parameters:**
- `limit` (optional): Number of questions to return (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": "abc123",
      "question": "How do I forgive someone who hurt me deeply?",
      "result": { /* BiblicalReasoning result */ },
      "timestamp": "2024-02-01T12:00:00.000Z",
      "processingTimeMs": 8542
    }
  ],
  "count": 20,
  "hasMore": true
}
```

#### `GET /api/v1/growth`

Get user's discipleship growth metrics.

**Response:**
```json
{
  "success": true,
  "trajectory": {
    "trajectory": "growing",
    "insights": [
      "Questions are becoming more thoughtful and detailed",
      "Frequent engagement with biblical guidance - good consistency"
    ]
  },
  "maturity": {
    "selfFocusRatio": 0.45,
    "questionDepth": 7.2,
    "faithLanguage": 8.5
  },
  "questionCount": 42,
  "firstQuestion": "2024-01-01T12:00:00.000Z",
  "lastQuestion": "2024-02-01T12:00:00.000Z"
}
```

#### `GET /api/v1/user/profile`

Get user profile and preferences.

**Response:**
```json
{
  "success": true,
  "profile": {
    "uid": "user123",
    "email": "user@example.com",
    "isPremium": false,
    "denomination": "protestant",
    "theologicalLean": "reformed",
    "preferences": {
      "showHebrewGreek": true,
      "enableCrossReferences": true,
      "preferredTranslation": "ESV"
    },
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-02-01T12:00:00.000Z"
  }
}
```

#### `PUT /api/v1/user/profile`

Update user profile and preferences.

**Request Body:**
```json
{
  "denomination": "baptist",
  "theologicalLean": "arminian",
  "preferences": {
    "showHebrewGreek": false,
    "enableCrossReferences": true,
    "preferredTranslation": "NIV"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

## Authentication Flow

### 1. User Signs In (Client-side)

```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await userCredential.user.getIdToken();
```

### 2. Make API Request with Token

```javascript
const response = await fetch('https://api.biblemind.com/api/v1/ask', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({
    question: 'How do I forgive someone who hurt me deeply?'
  })
});

const data = await response.json();
console.log(data.result.synthesis);
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": [] // Optional validation errors
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad request (validation error)
- `401`: Unauthorized (missing or invalid token)
- `429`: Rate limit exceeded
- `500`: Internal server error

## Development

### Run Tests

```bash
npm run test
```

### Lint Code

```bash
npm run lint
```

### Watch Mode

```bash
npm run dev
```

## Deployment

### Deploy to Railway

1. Create Railway account
2. Connect GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy automatically on push to `main`

### Deploy to Render

1. Create Render account
2. Connect GitHub repository
3. Add environment variables
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`

### Deploy to Google Cloud Run

```bash
# Build Docker image
docker build -t biblemind-api .

# Push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR-PROJECT-ID/biblemind-api

# Deploy to Cloud Run
gcloud run deploy biblemind-api \
  --image gcr.io/YOUR-PROJECT-ID/biblemind-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Monitoring

### Logs

View logs in production:

```bash
# Railway
railway logs

# Render
render logs

# Cloud Run
gcloud logs read
```

### Metrics to Monitor

- API response times (target: < 10s for complex questions)
- Error rates (target: < 1%)
- Rate limit hits
- OpenAI API usage and costs
- Firestore read/write operations
- Active users (free vs premium)

## Security

- ✅ **Helmet**: Security headers enabled
- ✅ **CORS**: Restricted to allowed origins
- ✅ **Rate Limiting**: Prevents abuse
- ✅ **Firebase Auth**: Industry-standard authentication
- ✅ **Input Validation**: Zod schema validation
- ✅ **Environment Variables**: Secrets not committed to git

## Cost Optimization

1. **Cache Common Questions**: Cache popular questions to reduce OpenAI API calls
2. **Optimize Token Usage**: Monitor and optimize prompt sizes
3. **Firestore Indexes**: Create indexes for common queries
4. **Rate Limiting**: Prevents abuse and runaway costs

## License

MIT
