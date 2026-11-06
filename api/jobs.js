import { db } from 'hatchable';

export const access = 'admin';
export const methods = ['GET'];

export default async function (req, res) {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query?.limit) || 100));
    const offset = Math.max(0, Number(req.query?.offset) || 0);
    const q = String(req.query?.q || '').trim().slice(0, 120);
    const status = String(req.query?.status || '').trim().slice(0, 60);
    const score = Math.min(100, Math.max(0, Number(req.query?.min_score) || 0));
    const result = await db.query(
      `SELECT * FROM jobs
       WHERE active = true
         AND ($1 = '' OR title ILIKE '%' || $1 || '%' OR company ILIKE '%' || $1 || '%' OR location ILIKE '%' || $1 || '%')
         AND ($2 = '' OR status = $2)
         AND score >= $3
       ORDER BY score DESC, discovered_at DESC
       LIMIT $4 OFFSET $5`,
      [q, status, score, limit, offset]
    );
    const count = await db.query(
      `SELECT COUNT(*)::int AS total FROM jobs
       WHERE active = true
         AND ($1 = '' OR title ILIKE '%' || $1 || '%' OR company ILIKE '%' || $1 || '%' OR location ILIKE '%' || $1 || '%')
         AND ($2 = '' OR status = $2) AND score >= $3`,
      [q, status, score]
    );
    return res.json({ jobs: result.rows, total: count.rows[0]?.total || 0 });
  } catch (e) {
    return res.status(500).json({ error: 'Unable to retrieve jobs.' });
  }
}