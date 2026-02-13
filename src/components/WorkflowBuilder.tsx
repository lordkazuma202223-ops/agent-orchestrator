'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Play, Save } from 'lucide-react';
import { AgentNode as AgentNodeType, Workflow } from '@/types/workflow';
import { NodeComponent, AgentNodeData } from './nodes/AgentNode';

const nodeTypes: NodeTypes = {
  agent: NodeComponent,
};

interface WorkflowBuilderProps {
  workflow: Workflow;
  onWorkflowChange: (workflow: Workflow) => void;
  onRun: () => void;
  onSave: () => void;
}

export function WorkflowBuilder({
  workflow,
  onWorkflowChange,
  onRun,
  onSave,
}: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Initialize nodes and edges from workflow
  useEffect(() => {
    const newNodes = workflow.agents.map((agent) => {
      const nodeData: AgentNodeData = {
        name: agent.name,
        prompt: agent.prompt,
        timeout: agent.timeout,
        dependsOn: agent.dependsOn,
        output: agent.output,
        onUpdate: updateAgent,
        onDelete: deleteAgent,
      };

      const node: Node = {
        id: agent.id,
        type: 'agent' as const,
        position: { x: 100 + workflow.agents.indexOf(agent) * 280, y: 150 },
        data: nodeData,
      };

      return node;
    });

    const newEdges = workflow.agents.flatMap((agent) =>
      agent.dependsOn.map((depId) => ({
        id: `${depId}-${agent.id}`,
        source: depId,
        target: agent.id,
        type: 'smoothstep' as const,
        animated: true,
      }))
    );

    setNodes(newNodes);
    setEdges(newEdges);
  }, [workflow]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;
      if (!source || !target) return;

      const updatedAgents = workflow.agents.map((agent) => {
        if (agent.id === target) {
          const newDependsOn = [...agent.dependsOn, source].filter(
            (id, index, self) => self.indexOf(id) === index
          );
          return { ...agent, dependsOn: newDependsOn };
        }
        return agent;
      });

      onWorkflowChange({ ...workflow, agents: updatedAgents });
      setEdges((eds) => addEdge({ ...connection, type: 'smoothstep', animated: true }, eds));
    },
    [workflow, setEdges]
  );

  const addAgent = useCallback(() => {
    const newAgent: AgentNodeType = {
      id: `agent-${Date.now()}`,
      name: `Agent ${workflow.agents.length + 1}`,
      prompt: '',
      timeout: 60000,
      dependsOn: [],
      output: 'text',
    };

    const updatedWorkflow = {
      ...workflow,
      agents: [...workflow.agents, newAgent],
    };

    onWorkflowChange(updatedWorkflow);
  }, [workflow, onWorkflowChange]);

  const updateAgent = useCallback(
    (agentId: string, updates: Partial<AgentNodeType>) => {
      const updatedAgents = workflow.agents.map((agent) =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      );

      onWorkflowChange({ ...workflow, agents: updatedAgents });
    },
    [workflow, onWorkflowChange]
  );

  const deleteAgent = useCallback(
    (agentId: string) => {
      const updatedAgents = workflow.agents.filter((agent) => agent.id !== agentId);

      const cleanedAgents = updatedAgents.map((agent) => ({
        ...agent,
        dependsOn: agent.dependsOn.filter((id) => id !== agentId),
      }));

      onWorkflowChange({ ...workflow, agents: cleanedAgents });

      setNodes((nds) => nds.filter((node) => node.id !== agentId));
      setEdges((eds) =>
        eds.filter(
          (edge) => edge.source !== agentId && edge.target !== agentId
        )
      );
    },
    [workflow, onWorkflowChange, setNodes, setEdges]
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <h1 className="text-lg sm:text-2xl font-bold text-white truncate">{workflow.name}</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={addAgent}
            className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Agent</span>
          </button>
          <button
            onClick={onSave}
            className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
          >
            <Save size={18} />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            onClick={onRun}
            className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
          >
            <Play size={18} />
            <span className="hidden sm:inline">Run</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          panOnScroll
          selectionOnDrag
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#ffffff20" gap={16} />
          <Controls
            className="bg-black/50 border-white/10 !hidden sm:!block"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
          <MiniMap
            className="bg-black/50 border-white/10 !hidden sm:!block"
            nodeColor="#6366f1"
            maskColor="rgba(0, 0, 0, 0.5)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
