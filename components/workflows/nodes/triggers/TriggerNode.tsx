"use client";
import { PlayCircle } from 'lucide-react';
import BaseNode from '../BaseNode';
interface TriggerNodeData {
    label?: string;
    subtitle?: string;
    triggerType?: string;
    schedule?: string;
    manual?: boolean;
    isConfigured?: boolean;
}
export default function TriggerNode({ data, id, selected }: {
    data: TriggerNodeData;
    id: string;
    selected?: boolean;
}) {
    return (<BaseNode id={id} selected={selected} nodeType="triggerNode" icon={<PlayCircle size={40} className="text-orange-400"/>} label={data.label || 'Start Review'} subtitle={data.subtitle || "Run governed workflow"} isConfigured={true} isTrigger={true}/>);
}
