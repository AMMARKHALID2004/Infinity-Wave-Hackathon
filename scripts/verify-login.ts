import "./env";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({
    email: "admin@novaworks.example",
    password: "Demo123!",
  });
  if (error || !data.user) throw new Error(`Admin login failed: ${error?.message ?? "no user returned"}`);
  const { data: verified, error: verifyError } = await client.auth.getUser();
  if (verifyError || verified.user?.id !== data.user.id) throw new Error("Admin session verification failed.");
  console.log("Admin login verified:", data.user.email);
  await client.auth.signOut();
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
