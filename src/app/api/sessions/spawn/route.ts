import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.NEXT_PUBLIC_GATEWAY_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Debug: log incoming request
    console.log('===== SPAWN REQUEST START =====');
    console.log('Request body:', JSON.stringify(body, null, 2));
    console.log('Request task:', body.task);
    console.log('Request label:', body.label);

    // Proxy to OpenClaw Gateway /v1/responses endpoint
    // OpenResponses API accepts input as string or array of items
    // timeoutSeconds parameter not supported by OpenResponses API
    const gatewayRequest = {
      model: 'openclaw',
      input: body.task,
      user: body.label || 'agent-orchestrator',
    };

    console.log('Gateway request:', JSON.stringify(gatewayRequest, null, 2));
    console.log('Gateway URL:', GATEWAY_URL);

    const response = await fetch(`${GATEWAY_URL}/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'x-openclaw-agent-id': 'main',
      },
      body: JSON.stringify(gatewayRequest),
    });

    console.log('Gateway response status:', response.status);
    console.log('Gateway response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Gateway response body:', responseText);
    console.log('===== SPAWN REQUEST END =====');

    // Include debug info in error response
    const debugInfoError = {
      gatewayUrl: GATEWAY_URL,
      requestTask: body.task,
      requestLabel: body.label,
      responseStatus: response.status,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      responseBody: responseText,
    };

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to spawn agent: ${response.status} ${responseText}`, debug: debugInfoError },
        { 
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    const data = await response.json();

    // Include debug info in success response
    const debugInfoSuccess = {
      gatewayUrl: GATEWAY_URL,
      requestTask: body.task,
      requestLabel: body.label,
      responseStatus: response.status,
      responseBody: data,
    };

    // Return response with CORS headers and debug info
    return NextResponse.json({ ...data, debug: debugInfoSuccess }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.log('Error in spawn handler:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

// Handle OPTIONS preflight requests
export async function OPTIONS(request: NextRequest) {
  console.log('===== OPTIONS REQUEST =====');
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
