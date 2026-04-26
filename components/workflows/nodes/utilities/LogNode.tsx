"use client";
import { ClipboardCheck } from 'lucide-react';
import BaseNode from '../BaseNode';
interface LogNodeData {
    label?: string;
    subtitle?: string;
    isConfigured?: boolean;
    level?: string;
    message?: string;
}
export default function LogNode({ data, id, selected }: {
    data: LogNodeData;
    id: string;
    selected?: boolean;
}) {
    const isConfigured = !!data.message;
    const subtitle = isConfigured ? (data.subtitle || `Level: ${data.level || 'info'}`) : 'Add audit message';
    return (<BaseNode id={id} selected={selected} nodeType="logNode" icon={<ClipboardCheck size={38} className="text-[#9AE6B4]"/>} label={data.label || 'Record Audit Trail'} subtitle={subtitle} isConfigured={isConfigured}/>);
}
