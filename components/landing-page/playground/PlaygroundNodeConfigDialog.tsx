"use client";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
type PlaygroundConfigNodeType = "manualTrigger" | "triggerNode" | "openaiNode" | "conditionNode" | "slackNode" | "logNode";
interface PlaygroundNodeConfigDialogProps {
    open: boolean;
    nodeId: string | null;
    nodeType: string | null;
    nodeData: Record<string, unknown> | null;
    onOpenChange: (open: boolean) => void;
    onSave: (nodeId: string, data: Record<string, unknown>) => void;
}
const SUPPORTED_NODE_TYPES = new Set<PlaygroundConfigNodeType>([
    "manualTrigger",
    "triggerNode",
    "openaiNode",
    "conditionNode",
    "slackNode",
    "logNode",
]);
function getDefaultLabel(nodeType: string | null): string {
    switch (nodeType) {
        case "manualTrigger":
        case "triggerNode":
            return "Start Review";
        case "openaiNode":
            return "Search Metadata";
        case "conditionNode":
            return "Lineage Gate";
        case "slackNode":
            return "Create Glossary Term";
        case "logNode":
            return "Record Audit Trail";
        default:
            return "Node";
    }
}
function getDialogMeta(nodeType: string | null): {
    title: string;
    description: string;
} {
    switch (nodeType) {
        case "manualTrigger":
        case "triggerNode":
            return {
                title: "Review Trigger Settings",
                description: "Customize the trigger label used in the interactive preview.",
            };
        case "openaiNode":
            return {
                title: "Metadata Search Settings",
                description: "Adjust the MCP tool and prompt for the preview execution.",
            };
        case "conditionNode":
            return {
                title: "Lineage Gate Settings",
                description: "Choose which branch will run in the preview workflow execution.",
            };
        case "slackNode":
            return {
                title: "Governance Action Settings",
                description: "Edit the governed write action content for the preview.",
            };
        case "logNode":
            return {
                title: "Audit Trail Settings",
                description: "Set log level and message for the preview.",
            };
        default:
            return {
                title: "Node Settings",
                description: "This node does not have playground settings.",
            };
    }
}
export function PlaygroundNodeConfigDialog({ open, nodeId, nodeType, nodeData, onOpenChange, onSave, }: PlaygroundNodeConfigDialogProps) {
    const initialData = nodeData ?? {};
    const [label, setLabel] = useState(() => typeof initialData.label === "string" && initialData.label.trim().length > 0
        ? initialData.label
        : getDefaultLabel(nodeType));
    const [model, setModel] = useState(() => typeof initialData.model === "string" ? initialData.model : "search_metadata");
    const [prompt, setPrompt] = useState(() => typeof initialData.prompt === "string"
        ? initialData.prompt
        : "Find customer PII tables and return the most relevant assets.");
    const [previewRoute, setPreviewRoute] = useState<"govern" | "audit">(() => initialData.previewRoute === "audit" ? "audit" : "govern");
    const [subtitle, setSubtitle] = useState(() => typeof initialData.subtitle === "string"
        ? initialData.subtitle
        : "Governed write action");
    const [message, setMessage] = useState(() => typeof initialData.message === "string"
        ? initialData.message
        : "Create glossary term after schema capability check.");
    const [logLevel, setLogLevel] = useState<"debug" | "info" | "warn" | "error">(() => initialData.level === "debug" ||
        initialData.level === "warn" ||
        initialData.level === "error"
        ? initialData.level
        : "info");
    const meta = useMemo(() => getDialogMeta(nodeType), [nodeType]);
    const isSupportedType = nodeType ? SUPPORTED_NODE_TYPES.has(nodeType as PlaygroundConfigNodeType) : false;
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!nodeId || !nodeType) {
            return;
        }
        const trimmedLabel = label.trim() || getDefaultLabel(nodeType);
        const payload: Record<string, unknown> = {
            label: trimmedLabel,
            isConfigured: true,
        };
        if (nodeType === "openaiNode") {
            payload.model = model.trim() || "search_metadata";
            payload.prompt = prompt.trim() || "Find customer PII tables and return the most relevant assets.";
            payload.credentialId = "openmetadata-mcp";
        }
        else if (nodeType === "conditionNode") {
            payload.routes = ["govern", "audit"];
            payload.previewRoute = previewRoute;
        }
        else if (nodeType === "slackNode") {
            payload.subtitle = subtitle.trim() || "Governed write action";
            payload.message = message.trim() || "Create glossary term after schema capability check.";
            payload.credentialId = "openmetadata-mcp";
        }
        else if (nodeType === "logNode") {
            payload.level = logLevel;
            payload.message = message.trim() || "Metadata review completed with lineage and schema context.";
        }
        onSave(nodeId, payload);
        onOpenChange(false);
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>

        {!isSupportedType ? (<div className="rounded-md border border-[#333] bg-[#151515] px-4 py-3 text-sm text-white/60">
            Playground settings are not available for this node type.
          </div>) : (<form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-white/80">Label</Label>
              <Input value={label} onChange={(event) => setLabel(event.target.value)} className="bg-[#2D2D2E] border-[#444] text-white placeholder:text-white/30" placeholder={getDefaultLabel(nodeType)}/>
            </div>

            {nodeType === "openaiNode" && (<>
                <div className="space-y-2">
                  <Label className="text-white/80">MCP Tool</Label>
                  <Input value={model} onChange={(event) => setModel(event.target.value)} className="bg-[#2D2D2E] border-[#444] text-white placeholder:text-white/30" placeholder="search_metadata"/>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Prompt</Label>
                  <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} className="w-full rounded-md border border-[#444] bg-[#2D2D2E] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-ring resize-none" placeholder="Find customer PII tables and return the most relevant assets."/>
                </div>
              </>)}

            {nodeType === "conditionNode" && (<div className="space-y-2">
                <Label className="text-white/80">Preview Route</Label>
                <select value={previewRoute} onChange={(event) => setPreviewRoute(event.target.value === "audit" ? "audit" : "govern")} className="w-full h-9 rounded-md border border-[#444] bg-[#2D2D2E] px-3 text-sm text-white focus:outline-none">
                  <option value="govern">Govern</option>
                  <option value="audit">Audit</option>
                </select>
              </div>)}

            {nodeType === "slackNode" && (<>
                <div className="space-y-2">
                  <Label className="text-white/80">Subtitle</Label>
                  <Input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} className="bg-[#2D2D2E] border-[#444] text-white placeholder:text-white/30" placeholder="Governed write action"/>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Message</Label>
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="w-full rounded-md border border-[#444] bg-[#2D2D2E] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-ring resize-none" placeholder="Create glossary term after schema capability check."/>
                </div>
              </>)}

            {nodeType === "logNode" && (<>
                <div className="space-y-2">
                  <Label className="text-white/80">Log Level</Label>
                  <select value={logLevel} onChange={(event) => setLogLevel(event.target.value === "debug" ||
                    event.target.value === "warn" ||
                    event.target.value === "error"
                    ? event.target.value
                    : "info")} className="w-full h-9 rounded-md border border-[#444] bg-[#2D2D2E] px-3 text-sm text-white focus:outline-none">
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Message</Label>
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="w-full rounded-md border border-[#444] bg-[#2D2D2E] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-ring resize-none" placeholder="Metadata review completed with lineage and schema context."/>
                </div>
              </>)}

            <DialogFooter>
              <Button type="button" variant="outline" className="border-[#444] bg-[#2D2D2E] text-white hover:bg-[#3A3A3A]" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#F04D26] hover:bg-[#e04420] text-white">
                Save
              </Button>
            </DialogFooter>
          </form>)}
      </DialogContent>
    </Dialog>);
}
