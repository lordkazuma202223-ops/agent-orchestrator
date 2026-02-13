# Agent Orchestrator

Multi-Agent Workflow Builder - Design, execute, and monitor AI agent workflows with OpenClaw Gateway integration.

## Features

- **Visual Workflow Builder** - Drag-and-drop interface to create agent workflows
- **Real-Time Execution Monitor** - Watch agents run live with progress tracking
- **OpenClaw Gateway Integration** - Spawn and manage agent sessions via OpenClaw
- **Workflow Templates** - Save and reuse workflow configurations
- **Beautiful Dark UI** - Modern gradient design with smooth animations

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Flow** - Visual workflow graph
- **Lucide React** - Icon library
- **OpenClaw Gateway** - Agent orchestration backend

## Getting Started

### Prerequisites

- Node.js 18+
- OpenClaw Gateway running on localhost:18789
- ngrok tunnel (or alternative) exposing Gateway to public URL

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_OPENCLAW_GATEWAY_URL=https://your-ngrok-url.ngrok-free.dev
GATEWAY_TOKEN=your_gateway_token_here
```

Get your Gateway token:
```bash
openclaw gateway config
```

### Start ngrok Tunnel

```bash
ngrok http 18789
```

Copy the ngrok URL and update `NEXT_PUBLIC_OPENCLAW_GATEWAY_URL`.

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```

## Usage

### Create a Workflow

1. Click "Add Agent" to add agent nodes
2. Click on a node to edit its name and prompt
3. Drag nodes to arrange them
4. Connect nodes by dragging from one node to another
5. Click "Save" to save your workflow
6. Click "Run Workflow" to execute

### Monitor Execution

The right panel shows:
- Agent status (pending, running, completed, failed)
- Execution time
- Agent output
- Errors (if any)

### Save & Load Workflows

- Click "Templates" to view saved workflows
- Click on a saved workflow to load it
- Workflows are stored in localStorage

## Architecture

```
┌─────────────────┐     HTTP/WebSocket     ┌──────────────────┐
│  Next.js        │ ←──────────────────→   │  OpenClaw        │
│  Dashboard      │                        │  Gateway         │
│  (Frontend)     │                        │  (ngrok URL)     │
└─────────────────┘                        └──────────────────┘
         │                                             │
         │ sessions_spawn API calls                    │
         │                                             │
         └─────────────────────────────────────────────┘
                              │
                              ↓
                    ┌─────────────────┐
                    │  Agent Sessions │
                    │  (Parallel)     │
                    └─────────────────┘
```

## Deployment to Vercel

### Environment Variables

Add to Vercel Project Settings:
- `NEXT_PUBLIC_OPENCLAW_GATEWAY_URL` = Your ngrok URL
- `GATEWAY_TOKEN` = Your Gateway token

### Deploy

```bash
npx vercel --yes
```

Or use Vercel CLI:
```bash
vercel --prod
```

## Important Notes

- **Keep ngrok running** while using the deployed site
- **ngrok URLs change** when you restart ngrok (use custom domain for stability)
- **Gateway must be running** locally (localhost:18789)

## Future Enhancements

- [ ] Workflow templates library
- [ ] Scheduled workflow execution (cron)
- [ ] WebSocket real-time updates
- [ ] Export/import workflows
- [ ] Workflow versioning
- [ ] Agent logs history
- [ ] Metrics and analytics
- [ ] Multi-user support

## License

MIT
