import { z } from 'zod';

export const CreateJobBody = z.object({ url: z.string().url().optional() });
export type CreateJobBody = z.infer<typeof CreateJobBody>;

export const FormatParam = z.enum(['txt','srt','vtt','json']);
