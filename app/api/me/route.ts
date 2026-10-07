import { accessErrorResponse, requireProfile, sessionProfile } from "@/lib/access";

export async function GET() {
  try {
    return Response.json({ profile: sessionProfile(await requireProfile()) });
  } catch (error) {
    return accessErrorResponse(error);
  }
}
