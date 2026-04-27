# OpenMetadata Steward Copilot

OpenMetadata Steward Copilot is a Next.js application for metadata discovery,
lineage inspection, and governed OpenMetadata MCP workflows.

## Setup

1. Copy `.env.example` to `.env.local` or `.env`
2. Add `OPENMETADATA_HOST`, `OPENMETADATA_TOKEN`, and `OPENAI_API_KEY`
3. Run `npm install`
4. Run `npm run dev`

## Workflows

The app supports:

- Metadata search with `search_metadata`
- Entity details and lineage inspection with `get_entity_details` and `get_entity_lineage`
- AI synthesis for PII impact reports.
- Tool schema inspection for governed extension workflows

## Safety Model

- The server talks directly to `{OPENMETADATA_HOST}/mcp` over JSON-RPC.
- Capabilities are discovered with `tools/list`, cached briefly, and checked
  before read or write workflows run.
- Unsupported tools return structured `missing_mcp_capability` responses rather
  than attempting unavailable governance actions.
- AI synthesis runs through a server route with a small per-IP rate limit because
  the prototype does not have user authentication yet.
- OpenMetadata remains the source of truth; the app stores only UI state.

## Commands

```bash
npm run dev
npm run lint
npm test
npm run build
npm run e2e
npm run smoke
```

`npm run smoke` requires valid OpenMetadata credentials and prints discovered
MCP tools plus a sample `search_metadata` response.
