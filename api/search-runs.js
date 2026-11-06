import { db } from 'hatchable';

export const access = 'public';
export const methods = ['GET'];

export default async function (req, res) {
  const result = await db.query(
    'SELECT id, started_at, completed_at, status, sources_checked, new_count, updated_count, unchanged_count, rejected_count, notes FROM search_runs ORDER BY started_at DESC LIMIT 30'
  );
  return res.json({ runs: result.rows });
}