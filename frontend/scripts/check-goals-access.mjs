import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
const base = env.match(/VITE_SUPABASE_URL="([^"]+)"/)?.[1]?.replace(/\/$/, "");
const key = env.match(/VITE_SUPABASE_ANON_KEY="([^"]+)"/)?.[1];

if (!base || !key) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function get(path) {
  const r = await fetch(`${base}${path}`, { headers });
  const body = await r.text();
  return { path, status: r.status, bodySample: body.slice(0, 250) };
}

const results = await Promise.all([
  get("/rest/v1/goals?select=goal_id,user_id,goal_title,percent_complete,frequency,priority_order,is_completed&limit=5"),
  get("/rest/v1/user_goals?select=user_goal_id,user_id,template_id,progress,is_completed&limit=5"),
  get("/rest/v1/goal_templates?select=template_id,title,period&limit=3"),
  get("/rest/v1/users?select=user_id,username,email&limit=1"),
]);

console.log(JSON.stringify({ projectHost: new URL(base).host, results }, null, 2));

