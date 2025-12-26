# @biblemind/web

**BibleMind Web Application**

Next.js web app for the BibleMind Biblical Holographic Reasoning Engine.

## Features

- 🎨 **Beautiful UI** - Clean, modern interface built with Tailwind CSS
- 🔐 **Firebase Auth** - Secure authentication with email/password and Google sign-in
- 💬 **Ask Questions** - Submit biblical questions and get multi-perspective analysis
- 📚 **History** - Review past questions and guidance
- 📈 **Growth Tracking** - Monitor spiritual maturity over time
- ⚙️ **Settings** - Customize denomination, theological lean, and Bible translation preferences

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **API Client**: Axios
- **Markdown**: React Markdown
- **Icons**: Lucide React

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API URL (backend server)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3001` (or 3000 if not in use).

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── auth/              # Authentication pages
│   │   ├── signin/
│   │   └── signup/
│   └── app/               # Main application
│       ├── layout.tsx     # App layout with sidebar
│       ├── ask/           # Ask questions page
│       ├── history/       # Question history
│       ├── growth/        # Growth tracking
│       └── settings/      # User settings
└── lib/                   # Utilities
    ├── firebase.ts        # Firebase config
    └── api.ts             # API client
```

## Pages

### Landing Page (`/`)
- Hero section with value proposition
- Features overview
- How it works explanation
- Pricing tiers
- Call-to-action

### Authentication (`/auth/signin`, `/auth/signup`)
- Email/password authentication
- Google OAuth sign-in
- Firebase Auth integration

### Ask Questions (`/app/ask`)
- Question input form
- Real-time processing status
- Markdown-rendered answers
- Scripture references display
- Confidence scores
- Example questions

### History (`/app/history`)
- List of all past questions
- Expandable answers
- Timestamps and metadata
- Scripture references

### Growth (`/app/growth`)
- Spiritual trajectory (growing/plateaued/declining)
- Maturity indicators:
  - Self-focus ratio
  - Question depth
  - Faith language
- Growth insights and tips

### Settings (`/app/settings`)
- Account information
- Denomination selection
- Theological lean preferences
- Bible translation selection
- Hebrew/Greek display toggle
- Cross-references toggle

## API Integration

The app communicates with the BibleMind API server (Express + Firebase) via the `api` client in `src/lib/api.ts`.

### Endpoints Used

- `POST /api/v1/ask` - Submit questions
- `GET /api/v1/history` - Retrieve question history
- `GET /api/v1/growth` - Get growth metrics
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update preferences

### Authentication

All API requests include a Firebase ID token in the `Authorization` header:

```typescript
Authorization: Bearer <firebase-id-token>
```

The token is automatically obtained from `firebase.auth().currentUser.getIdToken()`.

## Styling

### Tailwind CSS

The app uses a custom Tailwind configuration with:

- **Primary colors**: Blue tones for main actions
- **Spiritual colors**: Purple tones for spiritual content
- **Custom components**: Defined in `globals.css`
  - `.btn-primary` - Primary button
  - `.btn-secondary` - Secondary button
  - `.card` - Card container
  - `.input` / `.textarea` - Form inputs

### Typography

- **Sans-serif**: Inter (from Google Fonts)
- **Serif**: Crimson Text (for headings)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
vercel --prod
```

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Render
- Railway
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | BibleMind API server URL | Yes |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Yes |

## Development

### Running Locally

Make sure the API server is running first:

```bash
cd ../api
npm run dev
```

Then start the web app:

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable Authentication (Email/Password and Google)

### 2. Get Configuration

1. Go to Project Settings
2. Scroll to "Your apps"
3. Click "Web app" (</>)
4. Copy the configuration values to `.env.local`

### 3. Enable Authentication Methods

1. Go to Authentication → Sign-in method
2. Enable Email/Password
3. Enable Google

## Troubleshooting

### Firebase Auth Not Working

- Check that all Firebase env variables are set correctly
- Ensure Firebase project has authentication enabled
- Verify authorized domains in Firebase console

### API Requests Failing

- Check that `NEXT_PUBLIC_API_URL` points to running API server
- Verify Firebase ID token is being sent in headers
- Check browser console for CORS errors

### Styles Not Loading

- Run `npm run dev` again
- Clear `.next` folder: `rm -rf .next`
- Check Tailwind config is correct

## Contributing

See the main [PROJECT_STATUS.md](../../PROJECT_STATUS.md) for development roadmap.

## License

MIT
