-- The Crux CRM — D1 (SQLite) schema. Multi-tenant: every tenant row carries workspace_id.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  current_workspace_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  created_by TEXT,
  plan TEXT NOT NULL DEFAULT 'trial',           -- trial | starter | team | business
  plan_status TEXT NOT NULL DEFAULT 'trial',     -- trial | active | expired | canceled
  seats INTEGER NOT NULL DEFAULT 3,
  trial_ends_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'sales',            -- admin | sales | presales | management
  status TEXT NOT NULL DEFAULT 'active',         -- active | invited | disabled
  created_at INTEGER NOT NULL,
  UNIQUE (workspace_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_memberships_ws ON memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);

CREATE TABLE IF NOT EXISTS invites (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'sales',
  token TEXT NOT NULL UNIQUE,
  invited_by TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  accepted_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_invites_ws ON invites(workspace_id);

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_companies_ws ON companies(workspace_id);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  company_id TEXT,
  name TEXT,
  designation TEXT,
  email TEXT,
  phone TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contacts_ws ON contacts(workspace_id);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  company_name TEXT,
  contact_person TEXT,
  designation TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  requirement TEXT,
  owner_id TEXT,
  priority TEXT DEFAULT 'medium',                -- low | medium | high
  notes TEXT,
  next_follow_up INTEGER,
  status TEXT NOT NULL DEFAULT 'new',            -- new | contacted | qualified | unqualified | converted
  converted_opportunity_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_ws ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_ws_status ON leads(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(workspace_id, owner_id);

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT,
  company_id TEXT,
  contact_id TEXT,
  value REAL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  probability INTEGER DEFAULT 0,
  expected_close INTEGER,
  owner_id TEXT,
  stage TEXT NOT NULL DEFAULT 'qualified',       -- qualified | discovery | presales | proposal | negotiation | won | lost
  requirements TEXT,
  notes TEXT,
  next_action TEXT,
  follow_up_at INTEGER,
  presales_status TEXT DEFAULT 'none',           -- none | requested | in_progress | complete
  proposal_status TEXT DEFAULT 'none',           -- none | draft | sent | accepted | rejected
  source TEXT,
  lead_id TEXT,
  lost_reason TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  closed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_opps_ws ON opportunities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_opps_ws_stage ON opportunities(workspace_id, stage);
CREATE INDEX IF NOT EXISTS idx_opps_owner ON opportunities(workspace_id, owner_id);

CREATE TABLE IF NOT EXISTS presales (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  opportunity_id TEXT NOT NULL UNIQUE,
  owner_id TEXT,
  status TEXT NOT NULL DEFAULT 'requested',      -- requested | in_progress | complete
  customer_problem TEXT,
  business_requirements TEXT,
  functional_requirements TEXT,
  technical_requirements TEXT,
  integrations TEXT,
  module_mapping TEXT,
  customization TEXT,
  assumptions TEXT,
  dependencies TEXT,
  open_questions TEXT,
  demo_requirements TEXT,
  solution_notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_presales_ws ON presales(workspace_id);

CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  opportunity_id TEXT NOT NULL,
  name TEXT NOT NULL,
  version TEXT DEFAULT 'v1',
  value REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',          -- draft | internal_review | sent | negotiation | accepted | rejected
  owner_id TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  sent_at INTEGER,
  expected_response_at INTEGER,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_proposals_ws ON proposals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_proposals_opp ON proposals(workspace_id, opportunity_id);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  proposal_id TEXT,
  opportunity_id TEXT,
  filename TEXT NOT NULL,
  content_type TEXT,
  size INTEGER,
  r2_key TEXT NOT NULL,
  uploaded_by TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attachments_ws ON attachments(workspace_id);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  title TEXT NOT NULL,
  entity_type TEXT DEFAULT 'general',            -- lead | opportunity | general
  entity_id TEXT,
  owner_id TEXT,
  due_at INTEGER,
  priority TEXT DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',            -- open | done
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  completed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_tasks_ws ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_ws_status ON tasks(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_entity ON tasks(workspace_id, entity_type, entity_id);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id TEXT,
  type TEXT NOT NULL,
  detail TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(workspace_id, entity_type, entity_id);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT,
  user_id TEXT,
  event TEXT NOT NULL,
  props TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_ws ON analytics_events(workspace_id, event);

CREATE TABLE IF NOT EXISTS rate_events (
  id TEXT PRIMARY KEY,
  bucket TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_bucket ON rate_events(bucket, created_at);
