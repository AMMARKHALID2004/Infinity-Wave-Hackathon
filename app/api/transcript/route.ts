import { accessErrorResponse, requireTranscriptAdmin } from "@/lib/access";

// Creation is implemented in the next step. The role gate is active now so
// non-admin callers cannot reach a future transcript implementation.
export async function POST() {
  try {
    await requireTranscriptAdmin();
    return Response.json({ error: "Transcript creation is not implemented yet." }, { status: 501 });
  } catch (error) {
    return accessErrorResponse(error);
  }
}

export async function GET() {
  try {
    await requireTranscriptAdmin();
    return Response.json({ error: "Use POST to create from a transcript." }, { status: 405 });
  } catch (error) {
    return accessErrorResponse(error);
  }
}
