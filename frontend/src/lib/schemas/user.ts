import { z } from 'zod';

export const preferencesSchema = z.object({
  preferredCityId: z.string().uuid().optional(),
  timezone: z.string().optional(),
  astronomicalInterests: z.array(z.string()).optional(),
  language: z.string().optional(),
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
});

export type PreferencesFormData = z.infer<typeof preferencesSchema>;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  timezone: string | null;
  preferredCity: { id: string; name: string; countryCode: string } | null;
  astronomicalInterests: string[];
  language: string;
  theme: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface LocationOption {
  id: string;
  name: string;
  countryCode: string;
  timezone: string;
}
