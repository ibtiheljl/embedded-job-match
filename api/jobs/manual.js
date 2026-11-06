import { db } from 'hatchable';

export const access = 'admin';
export const methods = ['POST'];

export default async function (req, res) {
  const j = req.body || {};
  const title = String(j.title || '').trim().slice(0,250);
  const company = String(j.company || '').trim().slice(0,250);
  const location = String(j.location || '').trim().slice(0,250);
  const url = String(j.url || '').trim().slice(0,1500);
  if (!title || !company || !/^https:\/\//i.test(url)) {
    return res.status(400).json({ error: 'A title, company and HTTPS URL are required.' });
  }
  const bullets = Array.isArray(j.bullets) ? j.bullets.slice(0,12) : [];
  const result = await db.query(
    `INSERT INTO jobs (title,company,location,posted,source,url,contract,score,score_note,gaps,status,cv_title,profile,bullets,keywords,visa_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16)
     ON CONFLICT (lower(company),lower(title),lower(location)) DO UPDATE SET
       url=EXCLUDED.url,posted=EXCLUDED.posted,source=EXCLUDED.source,score=EXCLUDED.score,
       score_note=EXCLUDED.score_note,gaps=EXCLUDED.gaps,updated_at=now()
     RETURNING *`,
    [title,company,location,String(j.posted||'À vérifier').slice(0,120),String(j.source||'Ajout manuel').slice(0,120),url,
     String(j.contract||'À confirmer').slice(0,160),Math.max(0,Math.min(100,Number(j.score)||70)),
     'Ajout manuel', 'À vérifier après lecture de l’annonce.', 'À vérifier',
     'À personnaliser', 'À personnaliser après lecture de l’offre.',JSON.stringify(bullets),
     String(j.keywords||'').slice(0,1000),'À confirmer']
  );
  return res.status(201).json({ ok: true, job: result.rows[0] });
}