# OpenMetadata Steward Copilot

OpenMetadata Steward Copilot is a hackathon prototype that connects a Next.js
app to OpenMetadata MCP for metadata search, lineage analysis, glossary
creation, and tool-schema inspection.

## Setup

1. Copy `.env.example` to `.env.local` or `.env`
2. Add `OPENMETADATA_HOST` and `OPENMETADATA_TOKEN`
3. Run `npm install`
4. Run `npm run dev`

## Demo Flow

1. Select **Search customer PII** to call `search_metadata`
2. Select **Inspect impact** to call `get_entity_details` and `get_entity_lineage`
3. Select **Create glossary** or **Create glossary term** for safe governance writes
4. Select **Inspect extension schema** to show live schema-probed future actions

The payload editor stays editable so the demo can adapt to a sandbox or local
OpenMetadata dataset without code changes.

## Safety Model

- The server talks directly to `{OPENMETADATA_HOST}/mcp` over JSON-RPC.
- Capabilities are discovered with `tools/list`, cached briefly, and checked
  before read or write workflows run.
- Unsupported tools return structured `missing_mcp_capability` responses rather
  than attempting unavailable governance actions.
- OpenMetadata remains the source of truth; the app stores only UI state.

## Verification

```bash
npm run lint
npm test
npm run build
npm run e2e
```

`npm run smoke` is intentionally left as a real-instance check. It requires
valid OpenMetadata credentials and prints discovered tools plus a sample
`search_metadata` response.
