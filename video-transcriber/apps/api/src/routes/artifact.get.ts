import { FastifyPluginAsync } from 'fastify';
import { pg, s3 } from '../server';

const BKT_OUT = process.env.S3_BUCKET_OUTPUTS!;

const plugin: FastifyPluginAsync = async (app) => {
  app.get('/api/jobs/:id/artifact', async (req, reply) => {
    const id = (req.params as any).id;
    const format = String((req.query as any).format||'');
    if (!['txt','srt','vtt','json'].includes(format)) return reply.code(400).send({ error: 'bad format' });

    const { rows } = await pg.query('select * from artifacts where job_id=$1', [id]);
    if (!rows[0]) return reply.code(404).send({ error: 'no artifacts' });
    const art = rows[0];
    const key = art[`${format}_key`];
    if (!key) return reply.code(404).send({ error: 'missing artifact' });

    const obj = await s3.getObject({ Bucket: BKT_OUT, Key: key }).promise();
    const map: any = { txt: 'text/plain', srt: 'application/x-subrip', vtt: 'text/vtt', json: 'application/json' };
    reply.header('content-type', map[format]);
    reply.header('content-disposition', `attachment; filename=${id}.${format}`);
    return reply.send(obj.Body);
  });
};
export default plugin;
