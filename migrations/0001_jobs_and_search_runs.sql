CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  posted TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  contract TEXT NOT NULL DEFAULT 'À confirmer',
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  score_note TEXT NOT NULL DEFAULT '',
  gaps TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'À vérifier',
  cv_title TEXT NOT NULL DEFAULT '',
  profile TEXT NOT NULL DEFAULT '',
  bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords TEXT NOT NULL DEFAULT '',
  visa_status TEXT NOT NULL DEFAULT 'À confirmer',
  published_at TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_verified_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  raw_description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS jobs_identity_unique
  ON jobs (lower(company), lower(title), lower(location));
CREATE INDEX IF NOT EXISTS jobs_created_idx ON jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_score_idx ON jobs (score DESC);
CREATE TABLE IF NOT EXISTS search_runs (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'completed',
  sources_checked JSONB NOT NULL DEFAULT '[]'::jsonb,
  new_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  unchanged_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT ''
);