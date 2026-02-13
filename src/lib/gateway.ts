const GATEWAY_URL = process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.NEXT_PUBLIC_GATEWAY_TOKEN || '';

// Debug logging
if (typeof window !== 'undefined') {
  console.log('=== GATEWAY DEBUG ===');
  console.log('GATEWAY_URL:', GATEWAY_URL);
  console.log('GATEWAY_TOKEN:', GATEWAY_TOKEN ? `SET (${GATEWAY_TOKEN.slice(0, 10)}...)` : 'MISSING or EMPTY');
  console.log('====================');
}

export interface SpawnParams {
  task: string;
  label?: string;
  agentId?: string;
  timeoutSeconds?: number;
  model?: string;
}

export interface SpawnResult {
  sessionKey: string;
  message?: string;
  error?: string;
}

/**
 * Spawn a new agent session via OpenClaw Gateway
 */
export async function sessionsSpawn(params: SpawnParams): Promise<SpawnResult> {
  const response = await fetch(`${GATEWAY_URL}/api/sessions/spawn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(GATEWAY_TOKEN ? { 'Authorization': GATEWAY_TOKEN } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to spawn agent: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * Get session history
 */
export async function getSessionHistory(sessionKey: string, limit = 100): Promise<any> {
  const response = await fetch(`${GATEWAY_URL}/api/sessions/history?sessionKey=${sessionKey}&limit=${limit}`, {
    headers: {
      ...(GATEWAY_TOKEN ? { 'Authorization': GATEWAY_TOKEN } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get session history: ${response.status}`);
  }

  return response.json();
}

/**
 * Check Gateway health
 */
export async function checkGatewayHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${GATEWAY_URL}/api/session/status`, {
      method: 'GET',
      headers: {
        ...(GATEWAY_TOKEN ? { 'Authorization': GATEWAY_TOKEN } : {}),
      },
    });
    return response.ok;
  } catch (error) {

    return false;
  }
}
