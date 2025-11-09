import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { Pool } from 'pg';
import { createClient } from 'redis';
import AWS from 'aws-sdk';
import openapi from './openapi';
import jobsPost from './routes/jobs.post';
import jobsGet from './routes/jobs.get';
import artifactGet from './routes/artifact.get';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
await app.register(multipart, { limits: { fileSize: (Number(process.env.API_UPLOAD_MAX_MB)||250) * 1024 * 1024 } });
await app.register(openapi);

// PG
export const pg = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT||5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

// Redis
export const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();
export const QUEUE_KEY = process.env.REDIS_QUEUE_KEY || 'transcribe:jobs';

// S3
export const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION || 'us-east-1',
});

app.register(jobsPost);
app.register(jobsGet);
app.register(artifactGet);

const port = Number(process.env.API_PORT || 4000);
app.listen({ port, host: '0.0.0.0' });
