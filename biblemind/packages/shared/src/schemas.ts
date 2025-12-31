import { z } from 'zod';

export const PreferencesSchema = z.object({
  showHebrewGreek: z.boolean().optional(),
  enableCrossReferences: z.boolean().optional(),
  preferredTranslation: z.string().optional()
});

export const AskQuestionSchema = z.object({
  question: z.string().min(10).max(1000),
  userContext: z
    .object({
      denomination: z.string().optional(),
      theologicalLean: z.string().optional(),
      preferences: PreferencesSchema.optional()
    })
    .optional()
});

export const UpdateProfileSchema = z
  .object({
    denomination: z.string().optional(),
    theologicalLean: z.string().optional(),
    preferences: PreferencesSchema.optional(),
    savedPassages: z
      .array(
        z.object({
          reference: z.string(),
          note: z.string().optional(),
          tags: z.array(z.string()).optional()
        })
      )
      .optional()
  })
  .strict();

export const PaginationSchema = z
  .object({
    limit: z.coerce.number().int().positive().max(100).optional(),
    offset: z.coerce.number().int().min(0).optional()
  })
  .strict();

export type AskQuestionInput = z.infer<typeof AskQuestionSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
