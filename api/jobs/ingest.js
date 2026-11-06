import { db, config } from 'hatchable';

export const access = 'public';
export const methods = ['POST'];

function clean(v, max = 4000) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}
function scoreValue(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;
}

export default async function (req, res) {
  try {
    const expected = await config.get('JOBS_INGEST_API_KEY');
    const auth = String(req.headers?.authorization || '');
    const supplied = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!expected || !supplied || supplied.length !== expected.length) {
      return res.status(401).json({ error: 'Invalid or missing API credentials.' });
    }
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ supplied.charCodeAt(i);
    if (diff !== 0) return res.status(401).json({ error: 'Invalid or missing API credentials.' });

    const body = req.body || {};
    const items = Array.isArray(body.jobs) ? body.jobs : [body];
    if (!items.length || items.length > 100) return res.status(400).json({ error: 'Provide between 1 and 100 jobs.' });

    const summary = { created: 0, updated: 0, unchanged: 0, rejected: [] };
    for (let i = 0; i < items.length; i++) {
      const j = items[i] || {};
      const title = clean(j.title, 250), company = clean(j.company, 250);
      const location = clean(j.location, 250), url = clean(j.url, 1500);
      if (!title || !company || !url || !/^https:\/\//i.test(url)) {
        summary.rejected.push({ index: i, reason: 'title, company and HTTPS url are required.' });
        continue;
      }
      const bullets = Array.isArray(j.bullets) ? j.bullets.slice(0, 12).map(x => clean(x, 600)) : [];
      const result = await db.query(
        `INSERT INTO jobs
         (title,company,location,posted,source,url,contract,score,score_note,gaps,status,cv_title,profile,bullets,keywords,visa_status,published_at,last_verified_at,raw_description,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15,$16,$17,$18,$19,now())
         ON CONFLICT (lower(company), lower(title), lower(location))
         DO UPDATE SET
           posted=CASE WHEN EXCLUDED.posted<>'' THEN EXCLUDED.posted ELSE jobs.posted END,
           source=CASE WHEN EXCLUDED.source<>'' THEN EXCLUDED.source ELSE jobs.source END,
           url=EXCLUDED.url, contract=EXCLUDED.contract, score=EXCLUDED.score,
           score_note=EXCLUDED.score_note, gaps=EXCLUDED.gaps, cv_title=EXCLUDED.cv_title,
           profile=EXCLUDED.profile, bullets=EXCLUDED.bullets, keywords=EXCLUDED.keywords,
           visa_status=EXCLUDED.visa_status, published_at=COALESCE(EXCLUDED.published_at,jobs.published_at),
           last_verified_at=now(), raw_description=EXCLUDED.raw_description, updated_at=now()
         WHERE jobs.url IS DISTINCT FROM EXCLUDED.url
            OR jobs.score IS DISTINCT FROM EXCLUDED.score
            OR jobs.raw_description IS DISTINCT FROM EXCLUDED.raw_description
            OR jobs.posted IS DISTINCT FROM EXCLUDED.posted
         RETURNING id, (xmax = 0) AS inserted`,
        [title,company,location,clean(j.posted,120),clean(j.source,120),url,clean(j.contract,160)||'À confirmer',
         scoreValue(j.score),clean(j.scoreNote,500),clean(j.gaps,1500),clean(j.status,80)||'À vérifier',
         clean(j.cvTitle,250),clean(j.profile,3000),JSON.stringify(bullets),clean(j.keywords,1000),
         clean(j.visa_status || j.visaStatus,160)||'À confirmer',j.published_at || null,j.last_verified_at || new Date().toISOString(),
         clean(j.raw_description || j.description,10000)]
      );
      if (result.rows.length) {
        if (result.rows[0].inserted) summary.created++;
        else summary.updated++;
      } else summary.unchanged++;
    }
    return res.status(200).json({ ok: true, ...summary, received: items.length });
  } catch (e) {
    return res.status(500).json({ error: 'Ingestion failed.' });
  }
}