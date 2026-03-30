import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const t = fs.readFileSync(envPath, "utf8");

const urlMatch = t.match(/VITE_SUPABASE_URL="([^"]+)"/);
const keyMatch = t.match(/VITE_SUPABASE_ANON_KEY="([^"]+)"/);
const base = urlMatch?.[1];
const key = keyMatch?.[1];

if (!base || !key) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const root = base.replace(/\/$/, "");
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

const authResNoKey = await fetch(`${root}/auth/v1/health`);
const authRes = await fetch(`${root}/auth/v1/health`, { headers });
const restRes = await fetch(`${root}/rest/v1/`, { headers });

let rpcStatus = "skip";
try {
  const rpcRes = await fetch(`${root}/rest/v1/rpc/lookup_login_email`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ p_login: "__connection_test__" }),
  });
  rpcStatus = rpcRes.status;
} catch (e) {
  rpcStatus = `error: ${e.message}`;
}

const goalTemplates = await fetch(
  `${root}/rest/v1/goal_templates?select=template_id&limit=1`,
  { headers },
);

const out = {
  projectHost: new URL(root).host,
  authHealthWithoutApiKey: authResNoKey.status,
  authHealthWithAnonKey: authRes.status,
  restRoot: restRes.status,
  goalTemplatesSample: goalTemplates.status,
  rpcLookupLoginEmail: rpcStatus,
};

if (authResNoKey.status >= 400) {
  out.authHealthNoKeyHint = (await authResNoKey.text()).slice(0, 100);
}
if (goalTemplates.status >= 400) {
  out.goalTemplatesBodySample = (await goalTemplates.text()).slice(0, 120);
}

console.log(JSON.stringify(out, null, 2));
