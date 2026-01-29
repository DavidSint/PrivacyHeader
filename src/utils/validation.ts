import { z } from 'zod';

export const headerSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
});

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  urlRegex: z.string(),
  headers: z.array(headerSchema),
  enabled: z.boolean(),
});

export const exportSchema = z.array(profileSchema);

export type ProfileExport = z.infer<typeof exportSchema>;
