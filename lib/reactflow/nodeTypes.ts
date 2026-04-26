import TriggerNode from '@/components/workflows/nodes/triggers/TriggerNode';
import OpenAINode from '@/components/workflows/nodes/ai/OpenAINode';
import ConditionNode from '@/components/workflows/nodes/logic/ConditionNode';
import SlackNode from '@/components/workflows/nodes/integrations/SlackNode';
import LogNode from '@/components/workflows/nodes/utilities/LogNode';

export const nodeTypes = {
    manualTrigger: TriggerNode,
    openaiNode: OpenAINode,
    conditionNode: ConditionNode,
    slackNode: SlackNode,
    logNode: LogNode,
} as const;

export type NodeType = keyof typeof nodeTypes;
