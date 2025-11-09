import { FastifyPluginAsync } from 'fastify';
import { pg } from '../server';

const plugin: FastifyPluginAsync = async (app) => {
  app.get('/api/jobs/:id', async (req, reply) => {
    const id = (req.params as any).id;
    const { rows } = await pg.query('select * from jobs where id=$1', [id]);
    if (!rows[0]) return reply.code(404).send({ error: 'not found' });
    const job = rows[0];
    const a = await pg.query('select * from artifacts where job_id=$1', [id]);
    return reply.send({ job, artifacts: a.rows[0]||null });
  });
};
export default plugin;
