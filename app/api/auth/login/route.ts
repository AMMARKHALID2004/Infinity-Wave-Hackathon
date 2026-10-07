import { z } from "zod";
import { requireProfile, accessErrorResponse, sessionProfile } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";

const LoginInput = z.object({ email: z.email(), password: z.string().min(1) }).strict();

export async function POST(request: Request) {
  const input = LoginInput.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "Enter a valid email and password." }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(input.data);
  if (error) return Response.json({ error: "Invalid email or password." }, { status: 401 });
  try {
    const profile = await requireProfile();
    return Response.json({ profile: sessionProfile(profile) });
  } catch (error) {
    await supabase.auth.signOut();
    return accessErrorResponse(error);
  }
}
