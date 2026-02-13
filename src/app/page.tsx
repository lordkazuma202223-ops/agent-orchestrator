'use client';

import React, { useState } from 'react';
import { Workflow, WorkflowExecution, AgentResult } from '@/types/workflow';
import { WorkflowBuilder } from '@/components/WorkflowBuilder';
import { ExecutionMonitor } from '@/components/ExecutionMonitor';
import { sessionsSpawn } from '@/lib/gateway';
import { Save, Play, List, X, Monitor, ChevronUp } from 'lucide-react';

export default function Home() {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'workflow-1',
    name: 'Multi-Agent Workflow',
    description: 'Design and execute agent workflows',
    agents: [],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState<Workflow[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);

  const runWorkflow = async () => {
    if (workflow.agents.length === 0) {
      alert('Please add at least one agent to the workflow');
      return;
    }

    // Check if all agents have prompts
    const agentsWithoutPrompts = workflow.agents.filter(agent => !agent.prompt || agent.prompt.trim() === '');
    if (agentsWithoutPrompts.length > 0) {
      alert(`Please set prompts for all agents before running. Missing: ${agentsWithoutPrompts.map(a => a.name).join(', ')}`);
      return;
    }

    setIsExecuting(true);

    // Create execution object
    const newExecution: WorkflowExecution = {
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'running',
      results: workflow.agents.map((agent) => ({
        agentId: agent.id,
        agentName: agent.name,
        status: 'pending',
      })),
      startTime: new Date().toISOString(),
    };

    setExecution(newExecution);

    try {
      // Execute agents in sequence (simplified)
      // In production, handle dependencies properly
      const results: AgentResult[] = [];

      for (const agent of workflow.agents) {
        const agentResult: AgentResult = {
          agentId: agent.id,
          agentName: agent.name,
          status: 'running',
          startTime: new Date().toISOString(),
        };

        // Update execution with running agent
        setExecution({
          ...newExecution,
          results: [...results, agentResult],
        });

        const startTime = Date.now();

        try {
          const spawnResult = await sessionsSpawn({
            task: agent.prompt,
            label: agent.name,
            // timeoutSeconds parameter not supported by OpenResponses API
          });

          const endTime = Date.now();

          // Check if spawn failed
          if ('error' in spawnResult) {
            throw new Error(spawnResult.error);
          }

          // Extract output text from response
          const outputText = spawnResult.message || 'Agent spawned successfully';

          const completedResult: AgentResult = {
            ...agentResult,
            status: 'completed',
            output: { ...spawnResult, text: outputText },
            duration: endTime - startTime,
            endTime: new Date().toISOString(),
          };

          results.push(completedResult);

          setExecution({
            ...newExecution,
            results: [...results, completedResult],
          });
        } catch (error) {
          const failedResult: AgentResult = {
            ...agentResult,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - startTime,
            endTime: new Date().toISOString(),
          };

          results.push(failedResult);

          setExecution({
            ...newExecution,
            results: [...results, failedResult],
          });
        }
      }

      // Update final execution
      const finalExecution: WorkflowExecution = {
        ...newExecution,
        status: results.some((r) => r.status === 'failed') ? 'failed' : 'completed',
        results,
        endTime: new Date().toISOString(),
        totalDuration: Date.now() - new Date(newExecution.startTime).getTime(),
      };

      setExecution(finalExecution);
    } catch (error) {
      
      setExecution({
        ...newExecution,
        status: 'failed',
        endTime: new Date().toISOString(),
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const saveWorkflow = () => {
    const updatedWorkflow = {
      ...workflow,
      updatedAt: new Date().toISOString(),
    };

    setWorkflow(updatedWorkflow);
    setSavedWorkflows([...savedWorkflows, updatedWorkflow]);

    // Save to localStorage
    localStorage.setItem('workflows', JSON.stringify([...savedWorkflows, updatedWorkflow]));

    alert('Workflow saved!');
  };

  const loadWorkflow = (savedWorkflow: Workflow) => {
    setWorkflow(savedWorkflow);
    setShowTemplates(false);
  };

  // Load saved workflows from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('workflows');
    if (saved) {
      try {
        setSavedWorkflows(JSON.parse(saved));
      } catch (error) {
        
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
            Agent Orchestrator
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExecutionPanel(!showExecutionPanel)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors min-h-[44px]"
              title={showExecutionPanel ? 'Hide Execution' : 'Show Execution'}
            >
              <Monitor size={18} />
              <span className="hidden sm:inline">Execution</span>
              {showExecutionPanel && <ChevronUp size={16} className="sm:hidden" />}
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors min-h-[44px]"
            >
              <List size={18} />
              <span className="hidden sm:inline">Templates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">Saved Workflows</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {savedWorkflows.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No saved workflows yet</p>
              ) : (
                savedWorkflows.map((saved) => (
                  <button
                    key={saved.id}
                    onClick={() => loadWorkflow(saved)}
                    className="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors text-left"
                  >
                    <h3 className="text-white font-medium">{saved.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      {saved.agents.length} agents
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                      Updated: {new Date(saved.updatedAt).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-14 sm:pt-16 flex flex-col lg:flex-row gap-2 lg:gap-4 p-2 sm:p-4">
        {/* Left Panel - Workflow Builder */}
        <div className="flex-1 min-w-0 h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] lg:h-auto">
          <WorkflowBuilder
            workflow={workflow}
            onWorkflowChange={setWorkflow}
            onRun={runWorkflow}
            onSave={saveWorkflow}
          />
        </div>

        {/* Right Panel - Execution Monitor */}
        {(showExecutionPanel || execution) && (
          <div className="lg:w-96 w-full bg-slate-900/50 rounded-lg border border-slate-700 overflow-y-auto max-h-[50vh] lg:max-h-[calc(100vh-80px)]">
            <div className="sticky top-4">
              <ExecutionMonitor execution={execution} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
