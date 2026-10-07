import { accessErrorResponse, requireProfile } from "@/lib/access";

export async function GET() {
  try {
    return Response.json({ profile: await requireProfile() });
  } catch (error) {
    return accessErrorResponse(error);
  }
}
