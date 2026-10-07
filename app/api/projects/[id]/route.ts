import { z } from "zod";
import { accessErrorResponse, getProject, requireProfile } from "@/lib/access";

const ProjectId = z.uuid();

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireProfile();
    const parsed = ProjectId.safeParse((await params).id);
    if (!parsed.success) return Response.json({ error: "Invalid project ID" }, { status: 400 });
    return Response.json({ project: await getProject(profile, parsed.data) });
  } catch (error) {
    return accessErrorResponse(error);
  }
}
