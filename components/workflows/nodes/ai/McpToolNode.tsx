"use client";
import BaseNode from '../BaseNode';
import { Search } from 'lucide-react';
interface McpToolNodeData {
    label?: string;
    subtitle?: string;
    isConfigured?: boolean;
    credentialId?: string;
    toolName?: string;
    prompt?: string;
    inputMode?: "prompt" | "json";
    requestJson?: string;
}
function resolveInputMode(data: McpToolNodeData): "prompt" | "json" {
    return data.inputMode === "json" ? "json" : "prompt";
}
function getSubtitle(data: McpToolNodeData, isConfigured: boolean): string {
    const inputMode = resolveInputMode(data);
    if (isConfigured) {
        return data.subtitle || (data.toolName ? `Tool: ${data.toolName}` : 'Search metadata');
    }
    const missing: string[] = [];
    if (!data.credentialId?.trim())
        missing.push('credential');
    if (!data.toolName?.trim())
        missing.push('MCP tool');
    if (inputMode === "json") {
        if (!data.requestJson?.trim())
            missing.push('json input');
    }
    else if (!data.prompt?.trim()) {
        missing.push('prompt');
    }
    if (missing.length === 0)
        return 'Not configured';
    return `Setup needed: ${missing.join(', ')}`;
}
export default function McpToolNode({ data, id, selected }: {
    data: McpToolNodeData;
    id: string;
    selected?: boolean;
}) {
    const inputMode = resolveInputMode(data);
    const hasInput = inputMode === "json" ? !!data.requestJson?.trim() : !!data.prompt?.trim();
    const isConfigured = !!(data.credentialId?.trim() && data.toolName?.trim() && hasInput);
    return (<BaseNode id={id} selected={selected} nodeType="mcpToolNode" icon={<Search size={40} className="text-[#8D6AF0]"/>} label={data.label || 'Search Metadata'} subtitle={getSubtitle(data, isConfigured)} isConfigured={isConfigured}/>);
}
