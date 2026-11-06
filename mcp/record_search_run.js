export const access = 'admin';

export default {
  name: 'record_search_run',
  description: 'Record a daily job search outcome, including source coverage and counts. Call even when no new offers were found.',
  inputSchema: {
    type: 'object',
    properties: {
      status: { type: 'string' },
      sources_checked: { type: 'array', items: { type: 'string' } },
      new_count: { type: 'integer' },
      updated_count: { type: 'integer' },
      unchanged_count: { type: 'integer' },
      rejected_count: { type: 'integer' },
      notes: { type: 'string' }
    }
  },
  async handler(args, ctx) {
    const r = await ctx.db.query(
      `INSERT INTO search_runs (completed_at,status,sources_checked,new_count,updated_count,unchanged_count,rejected_count,notes)
       VALUES (now(),$1,$2::jsonb,$3,$4,$5,$6,$7) RETURNING id,started_at,completed_at`,
      [String(args.status||'completed').slice(0,40),JSON.stringify(Array.isArray(args.sources_checked)?args.sources_checked.slice(0,30):[]),
       Math.max(0,Number(args.new_count)||0),Math.max(0,Number(args.updated_count)||0),Math.max(0,Number(args.unchanged_count)||0),
       Math.max(0,Number(args.rejected_count)||0),String(args.notes||'').slice(0,2000)]
    );
    return { ok: true, run: r.rows[0] };
  }
};