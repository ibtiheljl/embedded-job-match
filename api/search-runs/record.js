import { db, config } from 'hatchable';

export const access = 'public';
export const methods = ['POST'];

export default async function (req, res) {
  const expected = await config.get('JOBS_INGEST_API_KEY');
  const auth = String(req.headers?.authorization || '');
  const supplied = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!expected || !supplied || supplied !== expected) return res.status(401).json({ error: 'Unauthorized.' });
  const b = req.body || {};
  const r = await db.query(
    `INSERT INTO search_runs (completed_at,status,sources_checked,new_count,updated_count,unchanged_count,rejected_count,notes)
     VALUES (now(),$1,$2::jsonb,$3,$4,$5,$6,$7) RETURNING id,started_at,completed_at`,
    [String(b.status || 'completed').slice(0,40),JSON.stringify(Array.isArray(b.sources_checked)?b.sources_checked.slice(0,30):[]),
     Math.max(0,Number(b.new_count)||0),Math.max(0,Number(b.updated_count)||0),Math.max(0,Number(b.unchanged_count)||0),
     Math.max(0,Number(b.rejected_count)||0),String(b.notes||'').slice(0,2000)]
  );
  return res.status(201).json({ ok: true, run: r.rows[0] });
}