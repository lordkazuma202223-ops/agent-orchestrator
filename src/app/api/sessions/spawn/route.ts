import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_URL = process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.NEXT_PUBLIC_GATEWAY_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a browser task
    const isBrowserTask = body.task?.toLowerCase().includes('browser') ||
                             body.task?.toLowerCase().includes('youtube') ||
                             body.task?.toLowerCase().includes('screenshot') ||
                             body.task?.toLowerCase().includes('open') ||
                             body.task?.toLowerCase().includes('click') ||
                             body.task?.toLowerCase().includes('goto') ||
                             body.task?.toLowerCase().includes('navigate');

    // For browser tasks, use /v1/responses with agent-browser agent
    if (isBrowserTask) {
      const gatewayRequest = {
        model: 'openclaw',
        input: [
          {
            type: 'message',
            role: 'user',
            content: body.task,
          },
        ],
      };

      const response = await fetch(`${GATEWAY_URL}/v1/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
          'x-openclaw-agent-id': 'agent-browser',
        },
        body: JSON.stringify(gatewayRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: `Failed to spawn browser agent: ${errorText}` },
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

      // Extract text from response
      const outputText = data.output?.[0]?.content?.[0]?.text || data.message || 'Browser task completed';

      return NextResponse.json(
        {
          sessionKey: data.id || 'generated-session',
          message: outputText,
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // For non-browser tasks, use 'main' agent directly
    const gatewayRequest = {
      model: 'openclaw',
      input: [
        {
          type: 'message',
          role: 'user',
          content: body.task,
        },
      ],
    };

    const response = await fetch(`${GATEWAY_URL}/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'x-openclaw-agent-id': 'main',
      },
      body: JSON.stringify(gatewayRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to spawn agent: ${response.status} ${errorText}` },
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

    // Extract text from response
    const outputText = data.output?.[0]?.content?.[0]?.text || 'Agent completed successfully';

    return NextResponse.json(
      {
        sessionKey: 'generated-session',
        message: outputText,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
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
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
