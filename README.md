# Infrastructure Security Agent (Temporal-Backed)

## Overview
This repository contains a functional "Agent Runtime" that automates cloud infrastructure security triaging. Built with **Next.js** and **Temporal**, the system identifies misconfigurations in cloud resources (like S3 Buckets or EC2 instances) and generates executable remediation plans.

## High-Level Architecture
The system follows a strict separation between orchestration and execution to meet the requirements for systems thinking:

* **Next.js Frontend**: Provides the interface for users to input a Resource ID and select the resource type (S3 or EC2).
* **Temporal Workflow (Orchestrator)**: Coordinates the 3-step audit process. It manages the state and ensures that if a tool fails, the audit can resume without losing data.
* **Temporal Activities (Tools)**: These are the modular "hands" of the agent. Each tool (Metadata Fetch, Risk Analysis, and Fix Generation) runs as an independent, retryable unit.

## Engineering Decisions

### 1. Workflow Determinism
To satisfy Temporal’s core constraints, the `infrastructureAuditWorkflow` is strictly deterministic. It contains no API calls or random logic. All side-effectful code—such as simulating a cloud metadata fetch—is isolated in Activities.

### 2. Failure Handling and Retries
We implemented explicit retry and timeout configurations to ensure the agent is production-minded:
* **Analysis Activity**: Given that security analysis often involves high-latency LLM or policy engine calls, this activity is configured with a 1-minute timeout.
* **Stateful Recovery**: If the system fails during the final "Remediation Script" generation, Temporal keeps the results of the "Metadata Fetch" and "Risk Analysis" in memory. When the worker restarts, it picks up exactly where it left off.

### 3. Structured Data Contracts
The system uses TypeScript to enforce clear input/output boundaries. Each audit produces a structured result containing the `violationFound` boolean, a `severity` level (e.g., CRITICAL), and a specific `remediationPlan`.

## Setup Instructions

### Prerequisites
* Node.js (v18+)
* Temporal CLI

### 1. Start Temporal Server
```bash
temporal server start-dev

```

### 2. Start the Worker

In a new terminal, run the background process that executes the audit tools:

```bash
npx tsx src/temporal/worker.ts

```

### 3. Start the Frontend

In a separate terminal:

```bash
npm run dev

```

Visit `http://localhost:3000`, enter a Resource ID, and click **"Start Security Audit"**.

## Production Roadmap

If this were a production system, I would implement the following:

* **Human-in-the-Loop**: Use Temporal **Signals** to pause the workflow after a "CRITICAL" violation is found, waiting for a human admin to approve before the remediation script is finalized.
* **Real-time Status**: Use Temporal **Queries** to allow the Next.js UI to poll for the current step (e.g., "Step 2: Analyzing Risk...") so the user has immediate feedback.
* **Tool Extensibility (MCP)**: Wrap the activities in the **Model Context Protocol (MCP)** so that new security scanners can be plugged into the agent runtime without changing the core workflow logic.