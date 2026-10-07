import { accessErrorResponse, listTeam, requireProfile } from "@/lib/access";

export async function GET() {
  try {
    await requireProfile();
    return Response.json({ team: await listTeam() });
  } catch (error) {
    return accessErrorResponse(error);
  }
}
