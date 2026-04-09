export async function GET() {
  return Response.json({
    service: "opsflow-ai",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
