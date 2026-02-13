'use client';

import React from 'react';
import { WorkflowExecution, AgentResult } from '@/types/workflow';
import { PlayCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ExecutionMonitorProps {
  execution: WorkflowExecution | null;
}

export function ExecutionMonitor({ execution }: ExecutionMonitorProps) {
  if (!execution) {
    return (
      <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
        <p className="text-slate-400 text-center">No execution in progress</p>
      </div>
    );
  }

  const getStatusIcon = (status: AgentResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-slate-400" />;
      case 'running':
        return <PlayCircle size={16} className="text-blue-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-400" />;
      case 'failed':
        return <XCircle size={16} className="text-red-400" />;
    }
  };

  const getStatusColor = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-slate-600';
      case 'running':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-green-600';
      case 'failed':
        return 'bg-red-600';
      case 'partial':
        return 'bg-yellow-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div>
          <h2 className="text-white font-semibold">{execution.workflowName}</h2>
          <p className="text-slate-400 text-sm mt-1">
            Started: {new Date(execution.startTime).toLocaleTimeString()}
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-lg font-semibold text-white ${getStatusColor(execution.status)}`}
        >
          {execution.status.toUpperCase()}
        </div>
      </div>

      {/* Agent Results */}
      <div className="space-y-3">
        {execution.results.map((result) => (
          <div
            key={result.agentId}
            className="p-4 bg-slate-800 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <h3 className="text-white font-medium">{result.agentName}</h3>
              </div>
              {result.duration && (
                <span className="text-slate-400 text-sm">
                  {Math.floor(result.duration / 1000)}s
                </span>
              )}
            </div>

            {result.status === 'running' && result.startTime && (
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full animate-pulse w-1/2" />
              </div>
            )}

            {result.status === 'completed' && result.output && (
              <div className="mt-3 p-3 bg-slate-900 rounded border border-slate-700">
                <p className="text-slate-300 text-sm whitespace-pre-wrap">
                  {typeof result.output === 'string'
                    ? result.output
                    : (result.output as any).text || result.output.message || 'Agent completed successfully'}
                </p>
              </div>
            )}

            {result.status === 'failed' && result.error && (
              <div className="mt-3 p-3 bg-red-900/20 rounded border border-red-700">
                <p className="text-red-400 text-sm">{result.error}</p>
              </div>
            )}

            {result.status === 'pending' && (
              <p className="text-slate-500 text-sm mt-3">Waiting for dependencies...</p>
            )}
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      {execution.totalDuration && (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Total Duration</span>
            <span className="text-white font-semibold">
              {Math.floor(execution.totalDuration / 1000)}s
            </span>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {execution.results.some((r) => r.output && typeof r.output === 'object' && 'debug' in r.output) && (
        <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <h3 className="text-yellow-400 font-semibold mb-2">Debug Information</h3>
          {execution.results.map((result) => {
            const debug = result.output && typeof result.output === 'object' ? (result.output as any).debug : null;
            if (debug) {
              return (
                <div key={result.agentId} className="space-y-2 text-xs">
                  <div className="text-slate-400">Agent: {result.agentName}</div>
                  <div className="text-slate-300">Status: {result.status}</div>
                  <div className="text-slate-300">Gateway URL: {debug?.gatewayUrl || 'N/A'}</div>
                  <div className="text-slate-300">Request: {debug?.requestTask || 'N/A'}</div>
                  <div className="text-slate-300">Response Status: {debug?.responseStatus || 'N/A'}</div>
                  {debug?.error && (
                    <div className="text-red-400">Error: {debug.error || 'N/A'}</div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
