import "server-only";
import { createAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";

export type Role = "ADMIN" | "MANAGER" | "AGENT";
export type CurrentProfile = {
  id: string;
  ref: string;
  name: string;
  role: Role;
  specialization: string;
  skills: string[];
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  // Direct table reads are denied by RLS; only the server may load this profile.
  const { data, error: profileError } = await createAdminClient()
    .from("profiles").select("id, ref, name, role, specialization, skills")
    .eq("id", user.id).single();
  if (profileError?.code === "PGRST116") return null;
  if (profileError) throw new Error("Unable to load the current profile.");
  return data as CurrentProfile;
}
