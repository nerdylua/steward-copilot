import {
  parseWorkflowRequest,
  workflowErrorResponse,
} from "@/lib/api/workflow-response";
import { env } from "@/lib/env";
import { getCachedCapabilities } from "@/lib/openmetadata/capabilities";
import { createMcpClient } from "@/lib/openmetadata/mcp-client";
import { runWriteWorkflow } from "@/lib/openmetadata/workflows/write";

export async function POST(request: Request) {
  try {
    const body = await parseWorkflowRequest(request);
    const client = createMcpClient({
      host: env.OPENMETADATA_HOST,
      token: env.OPENMETADATA_TOKEN,
    });
    const capabilities = await getCachedCapabilities(
      env.OPENMETADATA_HOST,
      client,
    );
    const result = await runWriteWorkflow(client, capabilities, body);

    return Response.json({ ok: true, result });
  } catch (error) {
    return workflowErrorResponse(error);
  }
}
