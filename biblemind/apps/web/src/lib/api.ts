/**
 * BibleMind API Client
 *
 * Handles all communication with the BibleMind REST API
 */

import axios, { AxiosInstance } from 'axios';
import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface BiblicalReasoning {
  status: 'complete' | 'partial' | 'vetoed';
  question: string;
  synthesis: string;
  confidence: number;
  reasoning: any;
  scriptures: Scripture[];
  processingTimeMs: number;
}

export interface Scripture {
  reference: string;
  text: string;
  testament: 'old' | 'new';
  book: string;
  chapter: number;
  verse: number;
  translation: string;
  context?: string;
}

export interface UserContext {
  denomination?: string;
  theologicalLean?: string;
  preferences?: {
    showHebrewGreek?: boolean;
    enableCrossReferences?: boolean;
    preferredTranslation?: string;
  };
}

export interface QuestionHistory {
  id: string;
  question: string;
  result: BiblicalReasoning;
  timestamp: string;
  processingTimeMs: number;
}

export interface GrowthMetrics {
  trajectory: {
    trajectory: string;
    insights: string[];
  };
  maturity: {
    selfFocusRatio: number;
    questionDepth: number;
    faithLanguage: number;
  };
  questionCount: number;
  firstQuestion: string | null;
  lastQuestion: string | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  isPremium: boolean;
  denomination?: string;
  theologicalLean?: string;
  preferences?: {
    showHebrewGreek?: boolean;
    enableCrossReferences?: boolean;
    preferredTranslation?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

class BibleMindAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to all requests
    this.client.interceptors.request.use(async (config) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Ask a biblical question
   */
  async askQuestion(
    question: string,
    userContext?: UserContext
  ): Promise<{ success: boolean; result: BiblicalReasoning }> {
    const response = await this.client.post('/api/v1/ask', {
      question,
      userContext,
    });
    return response.data;
  }

  /**
   * Get question history
   */
  async getHistory(
    limit = 20,
    offset = 0
  ): Promise<{ success: boolean; questions: QuestionHistory[]; count: number; hasMore: boolean }> {
    const response = await this.client.get('/api/v1/history', {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get growth metrics
   */
  async getGrowth(): Promise<{ success: boolean } & GrowthMetrics> {
    const response = await this.client.get('/api/v1/growth');
    return response.data;
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<{ success: boolean; profile: UserProfile }> {
    const response = await this.client.get('/api/v1/user/profile');
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; message: string }> {
    const response = await this.client.put('/api/v1/user/profile', updates);
    return response.data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

// Export singleton instance
export const api = new BibleMindAPI();
