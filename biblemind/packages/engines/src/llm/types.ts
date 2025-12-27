export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

export interface LanguageModel {
  generateJsonResponse(request: LLMRequest): Promise<string>;
}
