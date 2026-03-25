-- UI tabs: daily / weekly / monthly (Goals.jsx)
BEGIN;

ALTER TABLE goal_templates
  ADD COLUMN IF NOT EXISTS period VARCHAR(20) NOT NULL DEFAULT 'daily'
  CHECK (period IN ('daily', 'weekly', 'monthly'));

UPDATE goal_templates SET period = 'daily'
  WHERE template_id IN (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000002'
  );

UPDATE goal_templates SET period = 'weekly'
  WHERE template_id IN (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'aaaaaaaa-0000-0000-0000-000000000004',
    'aaaaaaaa-0000-0000-0000-000000000006'
  );

UPDATE goal_templates SET period = 'monthly'
  WHERE template_id IN (
    'aaaaaaaa-0000-0000-0000-000000000005',
    'aaaaaaaa-0000-0000-0000-000000000007',
    'aaaaaaaa-0000-0000-0000-000000000008',
    'aaaaaaaa-0000-0000-0000-000000000009',
    'aaaaaaaa-0000-0000-0000-000000000010'
  );

COMMIT;
