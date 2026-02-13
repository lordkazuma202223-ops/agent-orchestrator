const GATEWAY_URL = process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.NEXT_PUBLIC_GATEWAY_TOKEN || '';

// Debug logging
if (typeof window !== 'undefined') {
  console.log('=== GATEWAY DEBUG ===');
  console.log('GATEWAY_URL:', GATEWAY_URL);
  console.log('Raw GATEWAY_TOKEN value:', GATEWAY_TOKEN);
  console.log('GATEWAY_TOKEN length:', GATEWAY_TOKEN.length);
  console.log('Token starts with 07a5d?', GATEWAY_TOKEN.startsWith('07a5d'));
  console.log('Authorization header will be:', GATEWAY_TOKEN ? 'PRESENT' : 'MISSING');
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
  console.log('📡 SENDING REQUEST TO:', `${GATEWAY_URL}/api/sessions/spawn`);
  console.log('📋 Request params:', JSON.stringify(params));

  try {
    const response = await fetch(`${GATEWAY_URL}/api/sessions/spawn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(GATEWAY_TOKEN ? { 'Authorization': GATEWAY_TOKEN } : {}),
      },
      body: JSON.stringify(params),
    });

    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Error response:', error);
      throw new Error(`Failed to spawn agent: ${response.status} ${error}`);
    }

    const result = await response.json();
    console.log('✅ Success result:', result);
    return result;
  } catch (error) {
    console.log('❌ Fetch error:', error);
    console.log('❌ Error name:', error instanceof Error ? error.name : 'Unknown');
    console.log('❌ Error message:', error instanceof Error ? error.message : 'Unknown');
    throw error;
  }
}

/**
 * Get session history
 */
export async function getSessionHistory(sessionKey: string, limit = 100): Promise<any> {
  console.log('📡 REQUESTING HISTORY:', `${GATEWAY_URL}/api/sessions/history?sessionKey=${sessionKey}&limit=${limit}`);

  try {
    const response = await fetch(`${GATEWAY_URL}/api/sessions/history?sessionKey=${sessionKey}&limit=${limit}`, {
      headers: {
        ...(GATEWAY_TOKEN ? { 'Authorization': GATEWAY_TOKEN } : {}),
      },
    });

    if (!response.ok) {
      console.log('❌ History fetch failed:', response.status);
      throw new Error(`Failed to get session history: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.log('❌ History fetch error:', error);
    throw error;
  }
}

/**
 * Check Gateway health
 */
export async function checkGatewayHealth(): Promise<boolean> {
  console.log('📡 Checking health at:', `${GATEWAY_URL}/api/session/status`);

  try {
    const response = await fetch(`${GATEWAY_URL}/api/session/status`, {
      method: 'GET',
      headers: {
        ...(GATEWAY_TOKEN ? { 'Authorization': GATEWAY_TOKEN } : {}),
      },
    });

    console.log('📡 Health check status:', response.status, response.ok);
    return response.ok;
  } catch (error) {
    console.log('❌ Health check error:', error);
    return false;
  }
}
