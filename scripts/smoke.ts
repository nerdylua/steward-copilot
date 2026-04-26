import { loadEnvConfig } from "@next/env";

import { env } from "@/lib/env";
import { createMcpClient } from "@/lib/openmetadata/mcp-client";

loadEnvConfig(process.cwd());

async function main() {
  const client = createMcpClient({
    host: env.OPENMETADATA_HOST,
    token: env.OPENMETADATA_TOKEN,
  });

  const tools = await client.listTools();
  console.log(JSON.stringify(tools, null, 2));

  const sample = await client.callTool("search_metadata", {
    query: "customer",
    entityType: "table",
    size: 3,
  });

  console.log(JSON.stringify(sample, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
