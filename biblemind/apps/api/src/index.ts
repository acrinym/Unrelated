/**
 * BIBLEMIND API SERVER
 *
 * REST API for the BibleMind Biblical Holographic Reasoning Engine
 *
 * Features:
 * - Biblical question analysis via 10-engine holographic reasoning
 * - Firebase Authentication integration
 * - Rate limiting (10 req/day free, unlimited premium)
 * - User context management
 * - Question history tracking
 * - Discipleship growth tracking
 *
 * Stack:
 * - Express.js
 * - Firebase Admin SDK
 * - Gemini 2.0 Flash
 * - TypeScript
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { HolographicReasoningOrchestrator } from '@biblemind/engines';
import {
  AskQuestionSchema,
  buildUserContext,
  DEFAULT_USER_PREFERENCES,
  mergePreferences,
  PaginationSchema,
  UpdateProfileSchema
} from '@biblemind/shared';

// Load environment variables
dotenv.config();

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();
const auth = admin.auth();

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// ============================================================================
// RATE LIMITING
// ============================================================================

// Free tier: 10 requests per day
const freeTierLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10,
  message: { error: 'Free tier limit reached (10 questions/day). Upgrade to premium for unlimited access.' },
  skip: (req) => {
    // Skip rate limiting for premium users
    return (req as any).user?.isPremium === true;
  }
});

// Premium tier: 1000 requests per hour (prevent abuse)
const premiumLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: { error: 'Rate limit exceeded. Please try again later.' }
});

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    isPremium: boolean;
  };
}

async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);
    const decodedToken = await auth.verifyIdToken(token);

    // Fetch user profile from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    (req as AuthenticatedRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      isPremium: userData?.subscriptionStatus === 'active' || false
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ============================================================================
// ORCHESTRATOR INITIALIZATION
// ============================================================================

let orchestrator: HolographicReasoningOrchestrator | null = null;

function getOrchestrator(): HolographicReasoningOrchestrator {
  if (!orchestrator) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    orchestrator = new HolographicReasoningOrchestrator({
      geminiApiKey: process.env.GEMINI_API_KEY
      // knowledgeGraph will be added when user populates it
    });
  }

  return orchestrator;
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'BibleMind API',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /
 * Root endpoint with API documentation
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'BibleMind API',
    version: '0.1.0',
    description: 'Biblical Holographic Reasoning Engine - Multi-perspective theological analysis powered by 10 parallel reasoning engines',
    endpoints: {
      'GET /health': 'Health check',
      'POST /api/v1/ask': 'Ask a biblical question (requires authentication)',
      'GET /api/v1/history': 'Get question history (requires authentication)',
      'GET /api/v1/growth': 'Get discipleship growth metrics (requires authentication)',
      'GET /api/v1/user/profile': 'Get user profile and preferences (requires authentication)',
      'PUT /api/v1/user/profile': 'Update user profile (requires authentication)'
    },
    documentation: 'https://biblemind.com/docs'
  });
});

/**
 * POST /api/v1/ask
 * Main endpoint: Ask a biblical question
 */
app.post(
  '/api/v1/ask',
  authenticateUser,
  freeTierLimiter,
  premiumLimiter,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;

      // Validate request body
      const validation = AskQuestionSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors
        });
        return;
      }

      const { question, userContext } = validation.data;

      // Fetch user's question history for context
      const historySnapshot = await db
        .collection('users')
        .doc(authReq.user!.uid)
        .collection('questions')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      const recentQuestions = historySnapshot.docs.map(doc => doc.data().question as string);

      // Fetch user preferences
      const userDoc = await db.collection('users').doc(authReq.user!.uid).get();
      const userData = userDoc.data();

      // Build full user context
      const fullUserContext = buildUserContext({
        userId: authReq.user!.uid,
        requestContext: userContext,
        storedProfile: userData,
        recentQuestions
      });

      // Process question through orchestrator
      console.log(`[API] Processing question for user ${authReq.user!.uid}`);
      const result = await getOrchestrator().processQuestion(
        question,
        authReq.user!.uid,
        fullUserContext
      );

      // Save question and result to Firestore
      await db
        .collection('users')
        .doc(authReq.user!.uid)
        .collection('questions')
        .add({
          question,
          result,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          processingTimeMs: result.processingTimeMs
        });

      // Return result
      res.json({
        success: true,
        result,
        questionsRemaining: authReq.user!.isPremium ? 'unlimited' : undefined
      });

    } catch (error) {
      console.error('[API] Error processing question:', error);
      res.status(500).json({
        error: 'Failed to process question',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/history
 * Get user's question history
 */
app.get(
  '/api/v1/history',
  authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const pagination = PaginationSchema.safeParse({
        limit: req.query.limit,
        offset: req.query.offset
      });
      if (!pagination.success) {
        res.status(400).json({
          error: 'Invalid pagination parameters',
          details: pagination.error.flatten()
        });
        return;
      }

      const limit = pagination.data.limit ?? 20;
      const offset = pagination.data.offset ?? 0;

      const snapshot = await db
        .collection('users')
        .doc(authReq.user!.uid)
        .collection('questions')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const questions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({
        success: true,
        questions,
        count: questions.length,
        hasMore: questions.length === limit
      });

    } catch (error) {
      console.error('[API] Error fetching history:', error);
      res.status(500).json({
        error: 'Failed to fetch history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/growth
 * Get user's discipleship growth metrics
 */
app.get(
  '/api/v1/growth',
  authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;

      // Fetch all user questions
      const snapshot = await db
        .collection('users')
        .doc(authReq.user!.uid)
        .collection('questions')
        .orderBy('timestamp', 'asc')
        .get();

      const questions = snapshot.docs.map(doc => ({
        question: doc.data().question,
        date: doc.data().timestamp?.toDate() || new Date(),
        outcome: doc.data().outcome || ''
      }));

      // Import discipleship tracking functions
      const { DiscipleshipTracking } = await import('@biblemind/engines');

      // Analyze growth trajectory
      const trajectory = DiscipleshipTracking.analyzeGrowthTrajectory(questions);

      // Calculate maturity indicators
      const maturity = DiscipleshipTracking.calculateMaturityIndicators(
        questions.map(q => q.question)
      );

      res.json({
        success: true,
        trajectory,
        maturity,
        questionCount: questions.length,
        firstQuestion: questions[0]?.date || null,
        lastQuestion: questions[questions.length - 1]?.date || null
      });

    } catch (error) {
      console.error('[API] Error fetching growth metrics:', error);
      res.status(500).json({
        error: 'Failed to fetch growth metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/user/profile
 * Get user profile and preferences
 */
app.get(
  '/api/v1/user/profile',
  authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;

      const userDoc = await db.collection('users').doc(authReq.user!.uid).get();

      if (!userDoc.exists) {
        res.status(404).json({ error: 'User profile not found' });
        return;
      }

      const userData = userDoc.data();
      const preferences = mergePreferences(
        userData?.preferences,
        DEFAULT_USER_PREFERENCES
      );

      res.json({
        success: true,
        profile: {
          uid: authReq.user!.uid,
          email: authReq.user!.email,
          isPremium: authReq.user!.isPremium,
          denomination: userData?.denomination,
          theologicalLean: userData?.theologicalLean,
          preferences,
          savedPassages: userData?.savedPassages || [],
          createdAt: userData?.createdAt,
          updatedAt: userData?.updatedAt
        }
      });

    } catch (error) {
      console.error('[API] Error fetching profile:', error);
      res.status(500).json({
        error: 'Failed to fetch profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * PUT /api/v1/user/profile
 * Update user profile and preferences
 */
app.put(
  '/api/v1/user/profile',
  authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const validation = UpdateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Invalid request',
          details: validation.error.flatten()
        });
        return;
      }

      const updates = {
        ...validation.data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db
        .collection('users')
        .doc(authReq.user!.uid)
        .set(updates, { merge: true });

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('[API] Error updating profile:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[API] Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n🕊️  BibleMind API Server`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ All 10 reasoning engines loaded`);
  console.log(`\n📖 Endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   POST /api/v1/ask`);
  console.log(`   GET  /api/v1/history`);
  console.log(`   GET  /api/v1/growth`);
  console.log(`   GET  /api/v1/user/profile`);
  console.log(`   PUT  /api/v1/user/profile`);
  console.log(`\n🙏 "In the beginning was the Word..." - John 1:1\n`);
});

export default app;
