"use client";
import BaseNode from '../BaseNode';
import { BookOpenCheck } from 'lucide-react';
interface GovernanceActionNodeData {
    label?: string;
    subtitle?: string;
    isConfigured?: boolean;
    credentialId?: string;
    message?: string;
}
function getSubtitle(data: GovernanceActionNodeData, isConfigured: boolean): string {
    if (isConfigured) {
        return data.subtitle || 'Governed write action';
    }
    const noCredential = !data.credentialId;
    const noMessage = !data.message;
    if (noCredential && noMessage)
        return 'Add credential & message';
    if (noCredential)
        return 'Add credential';
    if (noMessage)
        return 'Add message';
    return 'Not configured';
}
export default function GovernanceActionNode({ data, id, selected }: {
    data: GovernanceActionNodeData;
    id: string;
    selected?: boolean;
}) {
    const isConfigured = !!(data.credentialId && data.message);
    return (<BaseNode id={id} selected={selected} nodeType="governanceActionNode" icon={<BookOpenCheck size={40} className="text-[#F04D26]"/>} label={data.label || 'Governance Action'} subtitle={getSubtitle(data, isConfigured)} isConfigured={isConfigured}/>);
}
