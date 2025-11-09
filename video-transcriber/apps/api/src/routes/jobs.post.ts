import { FastifyPluginAsync } from 'fastify';
import { pg, redis, QUEUE_KEY, s3 } from '../server';

const URL_ALLOWLIST = (process.env.URL_ALLOWLIST||'').split(',').map(s=>s.trim()).filter(Boolean);
const BKT_MEDIA = process.env.S3_BUCKET_MEDIA!;

const plugin: FastifyPluginAsync = async (app) => {
  app.route({
    method: 'POST', url: '/api/jobs',
    schema: { consumes: ['multipart/form-data'] },
    handler: async (req, reply) => {
      const parts = req.parts();
      let url: string|undefined; let fileBuf: Buffer|undefined; let fileName: string|undefined; let mime: string|undefined;
      for await (const p of parts) {
        if (p.type === 'file') { fileName = p.filename; mime = p.mimetype; fileBuf = await p.toBuffer(); }
        else if (p.type === 'field' && p.fieldname === 'url') { url = p.value as string; }
      }

      let sourceType: 'url'|'upload'; let objectKey: string|undefined; let sourceUrl: string|undefined;
      if (url) {
        try { new URL(url); } catch { return reply.code(400).send({ error: 'invalid url' }); }
        if (!URL_ALLOWLIST.some(host => (new URL(url!).host).includes(host))) {
          return reply.code(400).send({ error: 'url host not allowed' });
        }
        sourceType = 'url'; sourceUrl = url;
      } else if (fileBuf) {
        sourceType = 'upload';
        const safeName = (fileName||'upload').replace(/[^a-zA-Z0-9_.-]/g,'_');
        const key = `uploads/${Date.now()}_${safeName}`;
        await s3.putObject({ Bucket: BKT_MEDIA, Key: key, Body: fileBuf, ContentType: mime||'application/octet-stream' }).promise();
        objectKey = key;
      } else {
        return reply.code(400).send({ error: 'provide url or file' });
      }

      const { rows } = await pg.query(
        'insert into jobs(source_type, source_url, object_key) values($1,$2,$3) returning id,status',
        [sourceType, sourceUrl||null, objectKey||null]
      );
      const jobId = rows[0].id as string;

      await redis.lPush(QUEUE_KEY, JSON.stringify({ jobId, sourceType, sourceUrl, objectKey }));
      return reply.send({ id: jobId, status: 'pending' });
    }
  });
};
export default plugin;
