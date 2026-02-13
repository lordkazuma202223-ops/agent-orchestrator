export interface AgentNode {
  id: string;
  name: string;
  prompt: string;
  timeout: number; // milliseconds
  dependsOn: string[]; // array of agent IDs this agent depends on
  output?: 'json' | 'text' | 'file' | 'none';
  onUpdate?: (agentId: string, updates: Partial<AgentNode>) => void;
  onDelete?: (agentId: string) => void;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  agents: AgentNode[];
  schedule?: string; // cron expression
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentResult {
  agentId: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: any;
  error?: string;
  duration?: number; // milliseconds
  startTime?: string;
  endTime?: string;
}

export interface WorkflowExecution {
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial';
  results: AgentResult[];
  startTime: string;
  endTime?: string;
  totalDuration?: number; // milliseconds
}
