import { Worker } from '@temporalio/worker';
import * as activities from './activities';
import path from 'path';

async function run() {
const worker = await Worker.create({
    workflowsPath: path.resolve(__dirname, 'workflows.ts'), // Use absolute path
    activities,
    taskQueue: 'infra-audit-queue',
});

  console.log('Worker is online. Awaiting security tasks...');
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});