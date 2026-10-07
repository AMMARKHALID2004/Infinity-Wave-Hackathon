import { accessErrorResponse, listProjects, requireProfile } from "@/lib/access";

export async function GET() {
  try {
    const profile = await requireProfile();
    return Response.json({ projects: await listProjects(profile) });
  } catch (error) {
    return accessErrorResponse(error);
  }
}
