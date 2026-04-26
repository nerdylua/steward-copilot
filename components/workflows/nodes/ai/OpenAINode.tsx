"use client";
import BaseNode from '../BaseNode';
import { Search } from 'lucide-react';
interface OpenAINodeData {
    label?: string;
    subtitle?: string;
    isConfigured?: boolean;
    credentialId?: string;
    model?: string;
    prompt?: string;
    inputMode?: "prompt" | "json";
    requestJson?: string;
}
function resolveInputMode(data: OpenAINodeData): "prompt" | "json" {
    return data.inputMode === "json" ? "json" : "prompt";
}
function getSubtitle(data: OpenAINodeData, isConfigured: boolean): string {
    const inputMode = resolveInputMode(data);
    if (isConfigured) {
        return data.subtitle || (data.model ? `Tool: ${data.model}` : 'Search metadata');
    }
    const missing: string[] = [];
    if (!data.credentialId?.trim())
        missing.push('credential');
    if (!data.model?.trim())
        missing.push('model');
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
export default function OpenAINode({ data, id, selected }: {
    data: OpenAINodeData;
    id: string;
    selected?: boolean;
}) {
    const inputMode = resolveInputMode(data);
    const hasInput = inputMode === "json" ? !!data.requestJson?.trim() : !!data.prompt?.trim();
    const isConfigured = !!(data.credentialId?.trim() && data.model?.trim() && hasInput);
    return (<BaseNode id={id} selected={selected} nodeType="openaiNode" icon={<Search size={40} className="text-[#8D6AF0]"/>} label={data.label || 'Search Metadata'} subtitle={getSubtitle(data, isConfigured)} isConfigured={isConfigured}/>);
}
