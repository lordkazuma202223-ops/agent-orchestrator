export interface SpawnParams {
  task: string;
  label?: string;
  agentId?: string;
  model?: string;
}

export type SpawnResult =
  | { sessionKey: string; message?: string }
  | { error: string };

/**
 * Spawn a new agent session via Vercel API route (CORS proxy to OpenClaw Gateway)
 */
export async function sessionsSpawn(params: SpawnParams): Promise<SpawnResult> {
  try {
    const response = await fetch('/api/sessions/spawn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || 'Failed to spawn agent' };
    }

    const data = await response.json();

    // Extract output from response
    const outputText = data.output?.[0]?.content?.[0]?.text || data.message || 'Agent spawned successfully';

    return {
      sessionKey: 'generated-session',
      message: outputText,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
