import { optionalProfile } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  // Resolve session identity through the shared auth layer before signing out.
  await optionalProfile();
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return Response.json({ error: "Unable to sign out." }, { status: 500 });
  return Response.json({ ok: true });
}
