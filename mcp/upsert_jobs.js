export const access = 'admin';

export default {
  name: 'upsert_jobs',
  description: 'Save newly verified job offers to the Embedded Job Match dashboard. Deduplicates offers and never submits applications.',
  inputSchema: {
    type: 'object',
    required: ['jobs'],
    properties: {
      jobs: {
        type: 'array',
        items: {
          type: 'object',
          required: ['title', 'company', 'location', 'url'],
          properties: {
            title: { type: 'string' },
            company: { type: 'string' },
            location: { type: 'string' },
            url: { type: 'string' },
            posted: { type: 'string' },
            source: { type: 'string' },
            contract: { type: 'string' },
            score: { type: 'integer' },
            scoreNote: { type: 'string' },
            gaps: { type: 'string' },
            visaStatus: { type: 'string' },
            profile: { type: 'string' },
            cvTitle: { type: 'string' },
            bullets: { type: 'array', items: { type: 'string' } },
            keywords: { type: 'string' },
            description: { type: 'string' }
          }
        }
      }
    }
  },
  async handler({ jobs }, ctx) {
    if (!Array.isArray(jobs) || jobs.length < 1 || jobs.length > 100) throw new Error('Provide 1 to 100 jobs.');
    const summary = { created: 0, updated: 0, unchanged: 0, rejected: [] };
    for (let i = 0; i < jobs.length; i++) {
      const j = jobs[i] || {};
      const title = String(j.title || '').trim().slice(0,250);
      const company = String(j.company || '').trim().slice(0,250);
      const location = String(j.location || '').trim().slice(0,250);
      const url = String(j.url || '').trim().slice(0,1500);
      if (!title || !company || !location || !/^https:\/\//i.test(url)) {
        summary.rejected.push({ index: i, reason: 'title, company, location and HTTPS URL are required.' });
        continue;
      }
      const bullets = Array.isArray(j.bullets) ? j.bullets.slice(0,12).map(x => String(x).slice(0,600)) : [];
      const r = await ctx.db.query(
        `INSERT INTO jobs (title,company,location,posted,source,url,contract,score,score_note,gaps,status,cv_title,profile,bullets,keywords,visa_status,raw_description,last_verified_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'À vérifier',$11,$12,$13::jsonb,$14,$15,$16,now(),now())
         ON CONFLICT (lower(company),lower(title),lower(location)) DO UPDATE SET
           posted=CASE WHEN EXCLUDED.posted<>'' THEN EXCLUDED.posted ELSE jobs.posted END,
           source=EXCLUDED.source,url=EXCLUDED.url,contract=EXCLUDED.contract,score=EXCLUDED.score,
           score_note=EXCLUDED.score_note,gaps=EXCLUDED.gaps,cv_title=EXCLUDED.cv_title,profile=EXCLUDED.profile,
           bullets=EXCLUDED.bullets,keywords=EXCLUDED.keywords,visa_status=EXCLUDED.visa_status,
           raw_description=EXCLUDED.raw_description,last_verified_at=now(),updated_at=now()
         WHERE jobs.url IS DISTINCT FROM EXCLUDED.url OR jobs.score IS DISTINCT FROM EXCLUDED.score
            OR jobs.raw_description IS DISTINCT FROM EXCLUDED.raw_description OR jobs.posted IS DISTINCT FROM EXCLUDED.posted
         RETURNING id, (xmax = 0) AS inserted`,
        [title,company,location,String(j.posted||'').slice(0,120),String(j.source||'').slice(0,120),url,
         String(j.contract||'À confirmer').slice(0,160),Math.max(0,Math.min(100,Number(j.score)||0)),
         String(j.scoreNote||'').slice(0,500),String(j.gaps||'').slice(0,1500),String(j.cvTitle||'').slice(0,250),
         String(j.profile||'').slice(0,3000),JSON.stringify(bullets),String(j.keywords||'').slice(0,1000),
         String(j.visaStatus||'À confirmer').slice(0,160),String(j.description||'').slice(0,10000)]
      );
      if (!r.rows.length) summary.unchanged++;
      else if (r.rows[0].inserted) summary.created++;
      else summary.updated++;
    }
    return summary;
  }
};