import { db } from 'hatchable';

export const access = 'admin';
export const methods = ['PUT'];

export default async function (req, res) {
  const body = req.body || {};
  const id = Number(body.id);
  const status = String(body.status || '').trim();
  const allowed = ['À candidater','Candidature envoyée','Entretien','Refus','À vérifier','Sauvegardée'];
  if (!Number.isInteger(id) || id < 1 || !allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid job id or status.' });
  }
  const result = await db.query(
    'UPDATE jobs SET status = $1, updated_at = now() WHERE id = $2 RETURNING id, status',
    [status, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Job not found.' });
  return res.json({ ok: true, job: result.rows[0] });
}