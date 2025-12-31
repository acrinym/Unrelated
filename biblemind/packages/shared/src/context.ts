import {
  QuestionUserContext,
  StoredUserProfile,
  UserContextPayload,
  UserPreferences
} from './types';

export const DEFAULT_USER_PREFERENCES: Required<UserPreferences> = {
  showHebrewGreek: true,
  enableCrossReferences: true,
  preferredTranslation: 'ESV'
};

export function mergePreferences(
  primary?: UserPreferences,
  fallback?: UserPreferences
): Required<UserPreferences> {
  return {
    showHebrewGreek:
      primary?.showHebrewGreek ??
      fallback?.showHebrewGreek ??
      DEFAULT_USER_PREFERENCES.showHebrewGreek,
    enableCrossReferences:
      primary?.enableCrossReferences ??
      fallback?.enableCrossReferences ??
      DEFAULT_USER_PREFERENCES.enableCrossReferences,
    preferredTranslation:
      primary?.preferredTranslation ??
      fallback?.preferredTranslation ??
      DEFAULT_USER_PREFERENCES.preferredTranslation
  };
}

export interface BuildUserContextInput {
  userId: string;
  storedProfile?: StoredUserProfile | null;
  requestContext?: QuestionUserContext | null;
  recentQuestions?: string[];
}

export function buildUserContext({
  userId,
  storedProfile,
  requestContext,
  recentQuestions = []
}: BuildUserContextInput): UserContextPayload {
  const preferences = mergePreferences(
    requestContext?.preferences,
    storedProfile?.preferences
  );

  return {
    userId,
    denomination: requestContext?.denomination || storedProfile?.denomination,
    theologicalLean:
      requestContext?.theologicalLean || storedProfile?.theologicalLean,
    preferences,
    history: {
      recentQuestions,
      savedPassages: storedProfile?.savedPassages || []
    }
  };
}
