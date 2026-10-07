import { accessErrorResponse, listMyTasks, requireRole } from "@/lib/access";

export async function GET() {
  try {
    const profile = await requireRole("AGENT");
    return Response.json({ tasks: await listMyTasks(profile) });
  } catch (error) {
    return accessErrorResponse(error);
  }
}
