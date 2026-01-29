# Infrastructure Security Agent (Temporal-Backed)

## Overview
[cite_start]This repository contains a functional "Agent Runtime" that automates cloud infrastructure security triaging [cite: 1, 14-21]. Built with **Next.js** and **Temporal**, the system identifies misconfigurations in cloud resources (like S3 Buckets or EC2 instances) and generates executable remediation plans.

## High-Level Architecture
[cite_start]The system follows a strict separation between orchestration and execution to meet the senior-level requirements for systems thinking [cite: 1, 12, 86-88]:

* [cite_start]**Next.js Frontend**: Provides the interface for users to input a Resource ID and select the resource type (S3 or EC2) [cite: 1, 46-52].
* **Temporal Workflow (Orchestrator)**: Coordinates the 3-step audit process. It manages the state and ensures that if a tool fails, the audit can resume without losing data.
* **Temporal Activities (Tools)**: These are the modular "hands" of the agent. [cite_start]Each tool (Metadata Fetch, Risk Analysis, and Fix Generation) runs as an independent, retryable unit [cite: 1, 42-45].

## Engineering Decisions

### 1. Workflow Determinism
[cite_start]To satisfy Temporal’s "Non-Negotiable" constraints, the `infrastructureAuditWorkflow` is strictly deterministic[cite: 1, 28, 90]. It contains no API calls or random logic. [cite_start]All "side-effectful" code—such as simulating a cloud metadata fetch—is isolated in Activities[cite: 1, 29].

### 2. Failure Handling and Retries
[cite_start]We implemented explicit retry and timeout configurations to ensure the agent is "production-minded"[cite: 1, 40, 71, 91]:
* **Analysis Activity**: Given that security analysis often involves high-latency LLM or policy engine calls, this activity is configured with a 1-minute timeout.
* **Stateful Recovery**: If the system fails during the final "Remediation Script" generation, Temporal keeps the results of the "Metadata Fetch" and "Risk Analysis" in memory. When the worker restarts, it picks up exactly where it left off.

### 3. Structured Data Contracts
[cite_start]The system uses TypeScript to enforce clear input/output boundaries[cite: 1, 33, 44]. [cite_start]Each audit produces a structured result containing the `violationFound` boolean, a `severity` level (e.g., CRITICAL), and a specific `remediationPlan`[cite: 1, 19, 41].

## Setup Instructions

### Prerequisites
* Node.js (v18+)
* Temporal CLI ([Install instructions](https://docs.temporal.io/cli))

### 1. Start Temporal Server
```bash
temporal server start-dev

```

### 2. Start the Worker

In a new terminal, run the background process that executes the audit tools :

```bash
npx tsx src/temporal/worker.ts

```

### 3. Start the Frontend

In a separate terminal:

```bash
npm run dev

```

Visit `http://localhost:3000`, enter a Resource ID, and click **"Start Security Audit"** .

## Production Roadmap

If this were a production system at Conigma, I would implement the following:

* **Human-in-the-Loop**: Use Temporal **Signals** to pause the workflow after a "CRITICAL" violation is found, waiting for a human admin to click "Approve" before the remediation script is finalized.
* 
**Real-time Status**: Use Temporal **Queries** to allow the Next.js UI to poll for the current step (e.g., "Step 2: Analyzing Risk...") so the user isn't left waiting on a spinner.


* 
**Tool Extensibility (MCP)**: Wrap the activities in the **Model Context Protocol (MCP)** so that new security scanners can be plugged into the agent runtime without changing the core workflow code .
