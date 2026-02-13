'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Edit, Trash2, Clock, Zap } from 'lucide-react';
import { AgentNode as AgentNodeType } from '@/types/workflow';

export type AgentNodeData = {
  // Custom properties only - these go into the node's data object
  name: string;
  prompt: string;
  timeout: number;
  dependsOn: string[];
  output?: 'json' | 'text' | 'file' | 'none';
};

export function NodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as AgentNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(nodeData.name);
  const [prompt, setPrompt] = useState(nodeData.prompt);
  const [timeout, setTimeout] = useState(nodeData.timeout / 1000);

  const handleSave = () => {
    // This will be handled by the parent component through React Flow's events
    setIsEditing(false);
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-slate-800 shadow-xl transition-all ${
        selected ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-slate-600'
      }`}
      style={{ minWidth: '280px' }}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Left} className="!bg-green-500" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Zap size={16} className="text-purple-400" />
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700 text-white px-2 py-1 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          ) : (
            <span className="text-white font-semibold text-sm">{nodeData.name}</span>
          )}
        </div>
        <button
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
        >
          <Edit size={14} />
        </button>
      </div>

      {/* Prompt */}
      <div className="mb-2">
        {isEditing ? (
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter agent prompt..."
            className="w-full bg-slate-700 text-white text-xs px-2 py-1 rounded resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
          />
        ) : (
          <p className="text-slate-300 text-xs line-clamp-2">
            {nodeData.prompt || 'No prompt set...'}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Clock size={12} />
            <input
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(parseInt(e.target.value) || 60)}
              className="bg-slate-700 text-white px-2 py-1 rounded w-16 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span>sec</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{Math.floor(nodeData.timeout / 1000)}s</span>
          </div>
        )}

        <button className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors cursor-not-allowed">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
