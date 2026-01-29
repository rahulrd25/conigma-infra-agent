import { Connection, Client } from '@temporalio/client';
import { infrastructureAuditWorkflow } from '@/temporal/workflows';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const { resourceId, resourceType } = await req.json();

    // 1. Connect to the Temporal Server
    const connection = await Connection.connect({ address: 'localhost:7233' });
    const client = new Client({ connection });

    // 2. Start the Workflow
    const handle = await client.workflow.start(infrastructureAuditWorkflow, {
      args: [{ resourceId, resourceType }],
      taskQueue: 'infra-audit-queue',
      workflowId: `audit-${nanoid()}`,
    });

    // 3. Wait for the result (for this simple task)
    const result = await handle.result();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to run audit' }, { status: 500 });
  }
}