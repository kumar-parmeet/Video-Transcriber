export type JobPayload = {
  jobId: string;
  sourceType: 'url' | 'upload';
  sourceUrl?: string;      // when sourceType=url
  objectKey?: string;      // when sourceType=upload or fetched audio key
};

export const isJobPayload = (v: any): v is JobPayload => {
  return v && typeof v.jobId === 'string' && (v.sourceType === 'url' || v.sourceType === 'upload');
};
