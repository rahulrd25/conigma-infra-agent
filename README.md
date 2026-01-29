# Infrastructure Security Agent: Workflow Implementation

## Problem
Most automation tools are fragile. If the internet blips or a tool takes too long to respond, the whole process fails and you have to start from the beginning. For security audits, this is expensive and confusing because you end up with half-finished work.

## How this Agent Works:
This project implements an "Agent Runtime" that treats a security audit as a long running, reliable story rather than a single script execution.

1.  **The Trigger**: A user provides a Resource ID (like an S3 bucket name) through the Next.js frontend. This initiates the workflow.
2.  **The Workflow**: The Workflow doesn't perform the work itself. Instead, it holds the plan. It knows it must fetch data, analyze it, and then generate a fix. Because it is a Temporal workflow, it "remembers" exactly which step it is on.
3.  **The Tools (Activities)**:
    * **Step 1: Discovery**: The agent calls a tool to fetch resource metadata.
    * **Step 2: Analysis**: The metadata is passed to a specialized tool that looks for security violations (e.g., public access).
    * **Step 3: Remediation**: Based on the analysis, a final tool generates a specific command to fix the vulnerability.
4.  **The Result**: The Workflow gathers these results into a structured report and sends it back to the user.

## Technical Decisions

### Why separate the Workflow from the Tools?
I followed a strict separation between the **Workflow** and **Activities (Tools)** to ensure Determinism.

* The **Workflow** is purely logic. It doesn't talk to the outside world directly. This makes it deterministic, meaning if we re-run the logic, it always behaves the same way.
* The **Activities** handle the messy work, like simulated API calls. By keeping these separate, I ensured that if a "Tool" fails, the "Workflow" can simply try again without getting confused.

### Handling Failures and Retries
I implemented explicit retry policies for every tool:

* If the **Analysis Tool** is slow (common with AI or complex policy engines), I gave it a 1-minute timeout.
* If a tool fails after multiple retries, Temporal saves the state of the audit. When the issue is fixed, the agent resumes from the failed step instead of re-running the parts that already succeeded.

## Setup Instructions

### Prerequisites
* `Node.js (v18+)`
* `Temporal CLI`

### 1. Start the Orchestration Server
In your first terminal, start the Temporal development server:

```bash
temporal server start-dev

2. Start the Agent Worker
The worker is the process that actually runs the tools. 
In a second terminal:

```bash
npx tsx src/temporal/worker.ts

3. Start the Web Interface
In a third terminal:

```bash
npm run dev

Open http://localhost:3000 to interact with the agent.

## Production Considerations:
For a production-grade system, we would move beyond this minimal version:

Approval Gates: For critical security fixes, I would add a "Signal" step where the workflow pauses and waits for a human to click "Approve" in the UI before continuing.

Tool Discovery: I would implement the MCP. This would allow the agent to "pick" from a library of tools dynamically rather than having them hard-coded into the workflow.

Progress Tracking: I would use Queries so the UI can show exactly which step the agent is currently working on in real-time.