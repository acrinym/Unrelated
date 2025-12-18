import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMRequest, LanguageModel } from './types';

export class GeminiFlashClient implements LanguageModel {
  private model;

  constructor(apiKey: string, modelName = 'gemini-2.0-flash') {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: modelName
    });
  }

  async generateJsonResponse(request: LLMRequest): Promise<string> {
    const { systemPrompt, userPrompt, temperature = 0.3 } = request;

    const result = await this.model.generateContent({
      systemInstruction: { text: systemPrompt },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature,
        responseMimeType: 'application/json'
      }
    });

    return result.response.text();
  }
}
