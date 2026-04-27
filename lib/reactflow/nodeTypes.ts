import TriggerNode from '@/components/workflows/nodes/triggers/TriggerNode';
import McpToolNode from '@/components/workflows/nodes/ai/McpToolNode';
import ConditionNode from '@/components/workflows/nodes/logic/ConditionNode';
import GovernanceActionNode from '@/components/workflows/nodes/integrations/GovernanceActionNode';
import LogNode from '@/components/workflows/nodes/utilities/LogNode';

export const nodeTypes = {
    manualTrigger: TriggerNode,
    mcpToolNode: McpToolNode,
    conditionNode: ConditionNode,
    governanceActionNode: GovernanceActionNode,
    logNode: LogNode,
} as const;

export type NodeType = keyof typeof nodeTypes;
