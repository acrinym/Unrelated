/**
 * Shared BibleMind types for API and frontend clients.
 */

export interface UserPreferences {
  showHebrewGreek?: boolean;
  enableCrossReferences?: boolean;
  preferredTranslation?: string;
}

export interface SavedPassage {
  reference: string;
  note?: string;
  tags?: string[];
}

export interface StoredUserProfile {
  denomination?: string;
  theologicalLean?: string;
  preferences?: UserPreferences;
  savedPassages?: SavedPassage[];
  subscriptionStatus?: 'free' | 'active';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface QuestionHistoryEntry {
  id?: string;
  question: string;
  result?: unknown;
  timestamp?: unknown;
  processingTimeMs?: number;
  outcome?: string;
}

export interface QuestionUserContext {
  denomination?: string;
  theologicalLean?: string;
  preferences?: UserPreferences;
}

export interface UserContextPayload {
  userId: string;
  denomination?: string;
  theologicalLean?: string;
  preferences: Required<UserPreferences>;
  history: {
    recentQuestions: string[];
    savedPassages: SavedPassage[];
  };
}
