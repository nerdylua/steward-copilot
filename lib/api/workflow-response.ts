import { ZodError } from "zod";

export class WorkflowRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

export async function parseWorkflowRequest(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new WorkflowRequestError(
      "invalid_json",
      "Request body must be valid JSON.",
    );
  }
}

export function workflowErrorResponse(error: unknown) {
  if (error instanceof WorkflowRequestError) {
    return Response.json(
      { ok: false, code: error.code, error: error.message },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        ok: false,
        code: "invalid_workflow_input",
        error: "Workflow input did not match the expected schema.",
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  if (
    error instanceof Error &&
    error.message.startsWith("OpenMetadata instance is missing")
  ) {
    return Response.json(
      { ok: false, code: "missing_mcp_capability", error: error.message },
      { status: 424 },
    );
  }

  return Response.json(
    {
      ok: false,
      code: "openmetadata_workflow_failed",
      error: error instanceof Error ? error.message : "Unknown workflow error.",
    },
    { status: 502 },
  );
}
