# Signaliz Async Operations - Complete Implementation Guide

## Overview

This guide provides everything needed to implement status polling and results retrieval for Signaliz's async operations, based on real API responses and the Manus backend architecture.

---

## 1. Async Operation Flow Documentation

### Current Operation Types

Based on the screenshots, here are the actual async operations:

#### **Company Signal Enrichment** (SYNCHRONOUS ✅)
- **Status:** `completed` (returns immediately)
- **Response:** Full results with signals array
- **No polling needed** - results returned in initial response

#### **Deep Research** (ASYNC ⏳)
- **Initial Response:**
  ```json
  {
    "success": true,
    "data": {
      "task_id": "OqcfMHgQWr0M-RuuU8cHdK",
      "task_url": "https://manus.im/app/OqcfMHgQWr0M-RuuU8cHdK",
      "status": "processing",
      "message": "Task created successfully. Credits will be charged when task completes.",
      "webhook_configured": false
    }
  }
  ```

#### **Agentic Company Research** (ASYNC ⏳)
- **Initial Response:**
  ```json
  {
    "job_id": "1bd585f1-4dd6-47a8-b987-a84d5aae8104",
    "task_id": "TjyEVFNxIeUmsUYb4f2lpb",
    "status": "in_progress",
    "message": "Agentic research task started (targeting 1 company). Credits will be charged when task completes (1 credit per second).",
    "target_count": 1,
    "research_mode": "single-company",
    "estimated_time": "30-90 seconds"
  }
  ```

#### **Multipass Research** (ASYNC ⏳)

**Bulk Discovery Mode:**
```json
{
  "job_id": "e8e7c4E7-624a-4f54-ab3b-5834d9f4b7ef",
  "status": "started",
  "message": "Multipass research task started (targeting 10 companies). Credits will be charged when task completes (1 credit per second).",
  "target_count": 10,
  "max_allowed": 500,
  "research_mode": "bulk-discovery",
  "estimated_time": "20-40 seconds"
}
```

**Single Company Enrichment Mode:**
```json
{
  "job_id": "6638fabc-161c-4c01-8a4f-0877751ff6e4",
  "status": "started",
  "message": "Multipass research task started (targeting 1 company). Credits will be charged when task completes (1 credit per second).",
  "target_count": 1,
  "max_allowed": 500,
  "research_mode": "single-company",
  "estimated_time": "20-60 seconds"
}
```

### Complete Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CLIENT INITIATES REQUEST                                     │
│    POST /deep-research, /company-agentic-research, etc.         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SIGNALIZ API CREATES MANUS TASK                              │
│    - Validates workspace/API key                                │
│    - Constructs Manus task with instructions                    │
│    - Returns task_id immediately                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. MANUS EXECUTES TASK (Backend)                                │
│    Status: "pending" → "running" → "completed"/"failed"         │
│    - AI model selection and execution                           │
│    - Web searches and data gathering                            │
│    - Result compilation                                         │
│    - Credit calculation (1 credit/second)                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. RESULTS AVAILABLE                                            │
│    - Stored in Manus task output                                │
│    - Webhook fired (if configured)                              │
│    - Saved to Signaliz database                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Missing Pieces in Current API

❌ **No status polling endpoint** - Can't check if task is done  
❌ **No results retrieval endpoint** - Can't get results without webhook  
❌ **No task cancellation** - Can't stop running tasks  
❌ **No task listing** - Can't see workspace's tasks  

---

## 2. Status Polling Implementation Guide for Josh

### Endpoint Specification

**Endpoint:** `GET /v1/tasks/{task_id}/status`

**Authentication:** Bearer token (same as other endpoints)

**Rate Limit:** 100 requests/minute (same as other endpoints)

**Credit Charge:** **0 credits** (read-only operation)

### Request Format

```bash
GET https://api.signaliz.com/functions/v1/tasks/{task_id}/status
Authorization: Bearer YOUR_WORKSPACE_API_KEY
```

**Path Parameters:**
- `task_id` (string, required) - The task ID from initial response

### Response Format

#### Success Response (200 OK)

**Task Pending:**
```json
{
  "success": true,
  "task_id": "TjyEVFNxIeUmsUYb4f2lpb",
  "job_id": "1bd585f1-4dd6-47a8-b987-a84d5aae8104",
  "status": "pending",
  "message": "Task is queued and waiting to start",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:05Z",
  "estimated_completion": "2025-01-15T10:31:00Z"
}
```

**Task Running:**
```json
{
  "success": true,
  "task_id": "TjyEVFNxIeUmsUYb4f2lpb",
  "job_id": "1bd585f1-4dd6-47a8-b987-a84d5aae8104",
  "status": "running",
  "message": "Task is currently executing",
  "progress": {
    "companies_found": 12,
    "target_count": 25,
    "percentage": 48,
    "elapsed_seconds": 45
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:45Z",
  "estimated_completion": "2025-01-15T10:31:30Z"
}
```

**Task Completed:**
```json
{
  "success": true,
  "task_id": "TjyEVFNxIeUmsUYb4f2lpb",
  "job_id": "1bd585f1-4dd6-47a8-b987-a84d5aae8104",
  "status": "completed",
  "message": "Task completed successfully",
  "results_available": true,
  "companies_found": 25,
  "execution_time_seconds": 145,
  "credits_consumed": 145,
  "created_at": "2025-01-15T10:30:00Z",
  "completed_at": "2025-01-15T10:32:25Z"
}
```

**Task Failed:**
```json
{
  "success": false,
  "task_id": "TjyEVFNxIeUmsUYb4f2lpb",
  "job_id": "1bd585f1-4dd6-47a8-b987-a84d5aae8104",
  "status": "failed",
  "error": "Task execution failed",
  "error_details": "Insufficient credits or API timeout",
  "created_at": "2025-01-15T10:30:00Z",
  "failed_at": "2025-01-15T10:31:15Z"
}
```

#### Error Responses

**Task Not Found (404):**
```json
{
  "success": false,
  "error": "Task not found",
  "task_id": "invalid_task_id",
  "message": "No task found with this ID in your workspace"
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

**Wrong Workspace (403):**
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "This task belongs to a different workspace"
}
```

### Status Values

| Status | Description | Next Action |
|--------|-------------|-------------|
| `pending` | Task queued, not started yet | Keep polling |
| `running` | Task executing | Keep polling |
| `completed` | Task finished successfully | Get results |
| `failed` | Task encountered error | Check error details |

### Implementation: Proxy to Manus API

#### Step 1: Call Manus API

```javascript
// Signaliz backend implementation
async function getTaskStatus(taskId, workspaceId) {
  // 1. Validate task belongs to workspace
  const task = await db.tasks.findOne({
    task_id: taskId,
    workspace_id: workspaceId
  });

  if (!task) {
    return { success: false, error: "Task not found", status: 404 };
  }

  // 2. Call Manus API
  const manusResponse = await fetch(
    `https://api.manus.ai/v1/tasks/${taskId}`,
    {
      headers: { 'API_KEY': process.env.MANUS_API_KEY }
    }
  );

  const manusData = await manusResponse.json();

  // 3. Transform to Signaliz format
  return transformManusToSignaliz(manusData, task);
}
```

#### Step 2: Transform Manus Response

```javascript
function transformManusToSignaliz(manusData, signalizTask) {
  // Map Manus status to Signaliz status
  const statusMap = {
    'pending': 'pending',
    'running': 'running',
    'completed': 'completed',
    'failed': 'failed'
  };

  const status = statusMap[manusData.status] || 'pending';

  // Base response
  const response = {
    success: status !== 'failed',
    task_id: manusData.id,
    job_id: signalizTask.job_id,
    status: status,
    created_at: new Date(manusData.created_at * 1000).toISOString(),
    updated_at: new Date(manusData.updated_at * 1000).toISOString()
  };

  // Add status-specific fields
  if (status === 'running') {
    response.message = "Task is currently executing";
    response.progress = extractProgress(manusData, signalizTask);
  } else if (status === 'completed') {
    response.message = "Task completed successfully";
    response.results_available = true;
    response.execution_time_seconds = manusData.credit_usage || 0;
    response.credits_consumed = manusData.credit_usage || 0;
    response.completed_at = new Date(manusData.updated_at * 1000).toISOString();

    // Extract companies_found from output
    const companiesFound = extractCompaniesCount(manusData.output);
    if (companiesFound !== null) {
      response.companies_found = companiesFound;
    }
  } else if (status === 'failed') {
    response.error = "Task execution failed";
    response.error_details = manusData.error || "Unknown error";
    response.failed_at = new Date(manusData.updated_at * 1000).toISOString();
  } else {
    response.message = "Task is queued and waiting to start";
  }

  return response;
}

function extractProgress(manusData, signalizTask) {
  // Parse output messages to extract progress
  // This depends on how Manus reports progress in output array
  const targetCount = signalizTask.target_count || 25;
  const elapsedSeconds = manusData.credit_usage || 0;

  // Try to extract companies found from output
  let companiesFound = 0;
  if (manusData.output && Array.isArray(manusData.output)) {
    // Parse output to count companies
    companiesFound = extractCompaniesCount(manusData.output);
  }

  return {
    companies_found: companiesFound,
    target_count: targetCount,
    percentage: Math.min(100, Math.round((companiesFound / targetCount) * 100)),
    elapsed_seconds: elapsedSeconds
  };
}

function extractCompaniesCount(output) {
  if (!output || !Array.isArray(output)) return 0;

  // Look for assistant messages with company data
  for (const message of output) {
    if (message.role === 'assistant' && message.content) {
      for (const content of message.content) {
        if (content.type === 'output_text' && content.text) {
          // Try to parse JSON or count companies in text
          try {
            const data = JSON.parse(content.text);
            if (data.companies && Array.isArray(data.companies)) {
              return data.companies.length;
            }
          } catch (e) {
            // Not JSON, try regex matching
            const matches = content.text.match(/found (\d+) compan/i);
            if (matches) return parseInt(matches[1]);
          }
        }
      }
    }
  }

  return 0;
}
```

---

## 3. Results Retrieval Implementation Guide for Josh

### Endpoint Specification

**Endpoint:** `GET /v1/tasks/{task_id}/results`

**Authentication:** Bearer token (same as other endpoints)

**Rate Limit:** 100 requests/minute

**Credit Charge:** **0 credits** (read-only, results already paid for during execution)

### Request Format

```bash
GET https://api.signaliz.com/functions/v1/tasks/{task_id}/results
Authorization: Bearer YOUR_WORKSPACE_API_KEY
```

### Response Format

#### Deep Research Results (200 OK)

```json
{
  "success": true,
  "task_id": "OqcfMHgQWr0M-RuuU8cHdK",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "operation_type": "deep_research",
  "companies_found": 25,
  "results": {
    "companies": [
      {
        "name": "Example Tech Inc",
        "domain": "exampletech.com",
        "website": "https://exampletech.com",
        "linkedin_url": "https://linkedin.com/company/exampletech",
        "description": "B2B SaaS platform for data analytics",
        "industry": "B2B SaaS",
        "employees": "50-100",
        "headquarters": "Amsterdam, Netherlands",
        "reasoning": "Posted 5 data engineer roles on LinkedIn in the last 30 days. Raised €10M Series A in Dec 2024.",
        "sources": [
          {
            "description": "Senior Data Engineer job posting",
            "url": "https://linkedin.com/jobs/view/..."
          },
          {
            "description": "Series A funding announcement",
            "url": "https://techcrunch.com/2024/12/15/..."
          }
        ]
      }
    ]
  },
  "metadata": {
    "execution_time_seconds": 145,
    "credits_consumed": 145,
    "model_used": "anthropic/claude-sonnet-4.5",
    "created_at": "2025-01-15T10:30:00Z",
    "completed_at": "2025-01-15T10:32:25Z"
  }
}
```

#### Agentic Research Results (200 OK)

```json
{
  "success": true,
  "task_id": "TjyEVFNxIeUmsUYb4f2lpb",
  "job_id": "1bd585f1-4dd6-47a8-b987-a84d5aae8104",
  "status": "completed",
  "operation_type": "agentic_research",
  "research_mode": "single-company",
  "results": {
    "company": {
      "name": "Stripe",
      "domain": "stripe.com",
      "website": "https://stripe.com",
      "linkedin_url": "https://linkedin.com/company/stripe",
      "description": "Payment processing platform for internet businesses",
      "industry": "Fintech",
      "employees": "5000-10000",
      "headquarters": "San Francisco, CA",
      "research_findings": {
        "job_titles": [
          "Senior Backend Engineer - Payments",
          "Product Manager - Checkout",
          "Data Scientist - Risk"
        ],
        "hiring_trends": "Actively hiring across engineering and product teams",
        "recent_news": [
          {
            "title": "Stripe launches new embedded finance tools",
            "url": "https://stripe.com/newsroom/...",
            "date": "2025-01-10"
          }
        ],
        "tech_stack": ["Ruby", "Go", "React", "PostgreSQL"],
        "funding": {
          "total_raised": "$2.2B",
          "last_round": "Series I",
          "valuation": "$95B"
        }
      }
    }
  },
  "metadata": {
    "execution_time_seconds": 67,
    "credits_consumed": 67,
    "model_used": "anthropic/claude-sonnet-4.5",
    "created_at": "2025-01-15T10:30:00Z",
    "completed_at": "2025-01-15T10:31:07Z"
  }
}
```

#### Multipass Research Results (200 OK)

**Bulk Discovery Mode:**
```json
{
  "success": true,
  "task_id": "e8e7c4E7-624a-4f54-ab3b-5834d9f4b7ef",
  "job_id": "e8e7c4E7-624a-4f54-ab3b-5834d9f4b7ef",
  "status": "completed",
  "operation_type": "multipass_research",
  "research_mode": "bulk-discovery",
  "companies_found": 10,
  "results": {
    "companies": [
      {
        "name": "DataCorp",
        "domain": "datacorp.io",
        "website": "https://datacorp.io",
        "linkedin_url": "https://linkedin.com/company/datacorp",
        "description": "Enterprise data platform",
        "industry": "B2B SaaS",
        "employees": "100-250",
        "headquarters": "London, UK",
        "match_reason": "Matches criteria: B2B SaaS companies hiring data engineers"
      }
    ]
  },
  "metadata": {
    "target_count": 10,
    "max_allowed": 500,
    "execution_time_seconds": 35,
    "credits_consumed": 35,
    "model_used": "anthropic/claude-sonnet-4.5",
    "created_at": "2025-01-15T10:30:00Z",
    "completed_at": "2025-01-15T10:30:35Z"
  }
}
```

**Single Company Enrichment Mode:**
```json
{
  "success": true,
  "task_id": "6638fabc-161c-4c01-8a4f-0877751ff6e4",
  "job_id": "6638fabc-161c-4c01-8a4f-0877751ff6e4",
  "status": "completed",
  "operation_type": "multipass_research",
  "research_mode": "single-company",
  "results": {
    "company": {
      "name": "Snowflake",
      "domain": "snowflake.com",
      "website": "https://snowflake.com",
      "linkedin_url": "https://linkedin.com/company/snowflake-computing",
      "description": "Cloud data platform",
      "industry": "Cloud Infrastructure",
      "employees": "5000+",
      "headquarters": "Bozeman, MT",
      "enrichment_data": {
        "recent_activity": "Launched new AI/ML features in Q4 2024",
        "key_executives": [
          {
            "name": "Sridhar Ramaswamy",
            "title": "CEO",
            "linkedin": "https://linkedin.com/in/sridhar-ramaswamy"
          }
        ],
        "technologies": ["Snowflake", "Python", "Java", "Kubernetes"],
        "recent_hires": 45
      }
    }
  },
  "metadata": {
    "execution_time_seconds": 52,
    "credits_consumed": 52,
    "model_used": "anthropic/claude-sonnet-4.5",
    "created_at": "2025-01-15T10:30:00Z",
    "completed_at": "2025-01-15T10:30:52Z"
  }
}
```

#### Error Responses

**Task Not Completed (400):**
```json
{
  "success": false,
  "error": "Task not completed",
  "task_id": "TjyEVFNxIeUmsUYb4f2lpb",
  "status": "running",
  "message": "Results are not available yet. Current status: running"
}
```

**Task Failed (200 with error info):**
```json
{
  "success": false,
  "task_id": "TjyEVFNxIeUmsUYb4f2lpb",
  "status": "failed",
  "error": "Task execution failed",
  "error_details": "Insufficient credits to complete task",
  "metadata": {
    "created_at": "2025-01-15T10:30:00Z",
    "failed_at": "2025-01-15T10:31:15Z"
  }
}
```

**Task Not Found (404):**
```json
{
  "success": false,
  "error": "Task not found",
  "task_id": "invalid_task_id"
}
```

### Implementation: Extract Results from Manus

#### Step 1: Retrieve Task and Validate

```javascript
async function getTaskResults(taskId, workspaceId) {
  // 1. Validate task belongs to workspace
  const task = await db.tasks.findOne({
    task_id: taskId,
    workspace_id: workspaceId
  });

  if (!task) {
    return { success: false, error: "Task not found", status: 404 };
  }

  // 2. Check if results are cached in Signaliz DB
  if (task.results && task.status === 'completed') {
    return {
      success: true,
      ...task.results,
      metadata: {
        ...task.metadata,
        cached: true
      }
    };
  }

  // 3. Fetch from Manus if not cached
  const manusResponse = await fetch(
    `https://api.manus.ai/v1/tasks/${taskId}`,
    {
      headers: { 'API_KEY': process.env.MANUS_API_KEY }
    }
  );

  const manusData = await manusResponse.json();

  // 4. Check status
  if (manusData.status !== 'completed') {
    return {
      success: false,
      error: "Task not completed",
      task_id: taskId,
      status: manusData.status,
      message: `Results are not available yet. Current status: ${manusData.status}`,
      status_code: 400
    };
  }

  // 5. Extract and transform results
  const results = await extractResults(manusData, task);

  // 6. Cache results in Signaliz DB
  await db.tasks.updateOne(
    { task_id: taskId },
    {
      $set: {
        results: results,
        status: 'completed',
        completed_at: new Date()
      }
    }
  );

  return results;
}
```

#### Step 2: Extract Results from Manus Output

```javascript
async function extractResults(manusData, signalizTask) {
  // Parse Manus output array to extract company data
  const output = manusData.output || [];

  // Find the assistant's final output
  let companiesData = null;

  for (const message of output.reverse()) {
    if (message.role === 'assistant' && message.content) {
      for (const content of message.content) {
        if (content.type === 'output_text' && content.text) {
          try {
            // Try to parse as JSON
            const parsed = JSON.parse(content.text);
            if (parsed.companies || parsed.company) {
              companiesData = parsed;
              break;
            }
          } catch (e) {
            // Not JSON, might be markdown or text
            companiesData = parseMarkdownResults(content.text);
          }
        }
      }
      if (companiesData) break;
    }
  }

  if (!companiesData) {
    throw new Error("Could not extract results from task output");
  }

  // Transform based on operation type
  const operationType = signalizTask.operation_type;

  if (operationType === 'deep_research') {
    return formatDeepResearchResults(companiesData, manusData, signalizTask);
  } else if (operationType === 'agentic_research') {
    return formatAgenticResearchResults(companiesData, manusData, signalizTask);
  } else if (operationType === 'multipass_research') {
    return formatMultipassResults(companiesData, manusData, signalizTask);
  }

  throw new Error(`Unknown operation type: ${operationType}`);
}

function formatDeepResearchResults(data, manusData, task) {
  return {
    success: true,
    task_id: task.task_id,
    job_id: task.job_id,
    status: 'completed',
    operation_type: 'deep_research',
    companies_found: data.companies?.length || 0,
    results: {
      companies: data.companies.map(company => ({
        name: company.name,
        domain: company.domain || company.website?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
        website: company.website,
        linkedin_url: company.linkedin_url,
        description: company.description,
        industry: company.industry,
        employees: company.employees || company.employee_count,
        headquarters: company.headquarters || company.location,
        reasoning: company.reasoning || company.match_reason,
        sources: company.sources || []
      }))
    },
    metadata: {
      execution_time_seconds: manusData.credit_usage || 0,
      credits_consumed: manusData.credit_usage || 0,
      model_used: manusData.model || "anthropic/claude-sonnet-4.5",
      created_at: new Date(manusData.created_at * 1000).toISOString(),
      completed_at: new Date(manusData.updated_at * 1000).toISOString()
    }
  };
}

function formatAgenticResearchResults(data, manusData, task) {
  const company = data.company || data.companies?.[0];

  return {
    success: true,
    task_id: task.task_id,
    job_id: task.job_id,
    status: 'completed',
    operation_type: 'agentic_research',
    research_mode: task.research_mode || 'single-company',
    results: {
      company: {
        name: company.name,
        domain: company.domain,
        website: company.website,
        linkedin_url: company.linkedin_url,
        description: company.description,
        industry: company.industry,
        employees: company.employees,
        headquarters: company.headquarters,
        research_findings: company.research_findings || company.enrichment_data || {}
      }
    },
    metadata: {
      execution_time_seconds: manusData.credit_usage || 0,
      credits_consumed: manusData.credit_usage || 0,
      model_used: manusData.model || "anthropic/claude-sonnet-4.5",
      created_at: new Date(manusData.created_at * 1000).toISOString(),
      completed_at: new Date(manusData.updated_at * 1000).toISOString()
    }
  };
}

function formatMultipassResults(data, manusData, task) {
  const isBulkDiscovery = task.research_mode === 'bulk-discovery';

  if (isBulkDiscovery) {
    return {
      success: true,
      task_id: task.task_id,
      job_id: task.job_id,
      status: 'completed',
      operation_type: 'multipass_research',
      research_mode: 'bulk-discovery',
      companies_found: data.companies?.length || 0,
      results: {
        companies: data.companies.map(company => ({
          name: company.name,
          domain: company.domain,
          website: company.website,
          linkedin_url: company.linkedin_url,
          description: company.description,
          industry: company.industry,
          employees: company.employees,
          headquarters: company.headquarters,
          match_reason: company.match_reason || company.reasoning
        }))
      },
      metadata: {
        target_count: task.target_count,
        max_allowed: task.max_allowed || 500,
        execution_time_seconds: manusData.credit_usage || 0,
        credits_consumed: manusData.credit_usage || 0,
        model_used: manusData.model || "anthropic/claude-sonnet-4.5",
        created_at: new Date(manusData.created_at * 1000).toISOString(),
        completed_at: new Date(manusData.updated_at * 1000).toISOString()
      }
    };
  } else {
    // Single company enrichment
    const company = data.company || data.companies?.[0];

    return {
      success: true,
      task_id: task.task_id,
      job_id: task.job_id,
      status: 'completed',
      operation_type: 'multipass_research',
      research_mode: 'single-company',
      results: {
        company: {
          name: company.name,
          domain: company.domain,
          website: company.website,
          linkedin_url: company.linkedin_url,
          description: company.description,
          industry: company.industry,
          employees: company.employees,
          headquarters: company.headquarters,
          enrichment_data: company.enrichment_data || company.research_findings || {}
        }
      },
      metadata: {
        execution_time_seconds: manusData.credit_usage || 0,
        credits_consumed: manusData.credit_usage || 0,
        model_used: manusData.model || "anthropic/claude-sonnet-4.5",
        created_at: new Date(manusData.created_at * 1000).toISOString(),
        completed_at: new Date(manusData.updated_at * 1000).toISOString()
      }
    };
  }
}

function parseMarkdownResults(text) {
  // Fallback parser for markdown/text output
  // This is a simplified version - you may need more robust parsing
  const companies = [];

  // Look for company blocks in markdown
  const companyBlocks = text.split(/\n#{1,3}\s+/);

  for (const block of companyBlocks) {
    if (block.trim().length === 0) continue;

    const company = {
      name: extractField(block, /^(.+?)$/m),
      website: extractField(block, /Website:\s*(.+)/i),
      linkedin_url: extractField(block, /LinkedIn:\s*(.+)/i),
      description: extractField(block, /Description:\s*(.+)/i),
      industry: extractField(block, /Industry:\s*(.+)/i),
      employees: extractField(block, /Employees:\s*(.+)/i),
      headquarters: extractField(block, /Headquarters:\s*(.+)/i)
    };

    if (company.name) {
      companies.push(company);
    }
  }

  return { companies };
}

function extractField(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}
```

### Caching Strategy

**Cache results in Signaliz database:**
- Store full results when first retrieved
- Subsequent calls return cached data (add `cached: true` to metadata)
- Cache indefinitely (results don't change)
- Reduces Manus API calls and improves response time

**Database Schema:**
```javascript
{
  task_id: "TjyEVFNxIeUmsUYb4f2lpb",
  job_id: "1bd585f1-4dd6-47a8-b987-a84d5aae8104",
  workspace_id: "ws_123",
  operation_type: "agentic_research",
  status: "completed",
  results: { /* full results object */ },
  metadata: { /* execution metadata */ },
  created_at: ISODate("2025-01-15T10:30:00Z"),
  completed_at: ISODate("2025-01-15T10:31:07Z")
}
```

---

## 4. n8n Workflow Patterns

### Pattern 1: Simple Polling with Wait Node

**Use Case:** Single company research with known completion time

```
┌─────────────────────┐
│ 1. Signaliz Node    │
│ (Start Research)    │
│ Returns: task_id    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Wait Node        │
│ Duration: 60s       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. Signaliz Node    │
│ (Get Results)       │
│ Input: task_id      │
└─────────────────────┘
```

**Configuration:**
```json
{
  "nodes": [
    {
      "name": "Start Research",
      "type": "n8n-nodes-signaliz.signaliz",
      "parameters": {
        "resource": "Agentic Research",
        "operation": "Research Company",
        "companyName": "Stripe",
        "researchPrompt": "What are their current job openings?"
      }
    },
    {
      "name": "Wait",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": 60,
        "unit": "seconds"
      }
    },
    {
      "name": "Get Results",
      "type": "n8n-nodes-signaliz.signaliz",
      "parameters": {
        "resource": "Tasks",
        "operation": "Get Results",
        "taskId": "={{ $('Start Research').item.json.task_id }}"
      }
    }
  ]
}
```

### Pattern 2: Polling Loop with Status Checks

**Use Case:** Bulk research with unknown completion time

```
┌─────────────────────┐
│ 1. Signaliz Node    │
│ (Start Research)    │
│ Returns: task_id    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Loop Node        │◄──────────┐
│ (Until Complete)    │           │
└──────────┬──────────┘           │
           │                      │
           ▼                      │
┌─────────────────────┐           │
│ 3. Signaliz Node    │           │
│ (Check Status)      │           │
│ Input: task_id      │           │
└──────────┬──────────┘           │
           │                      │
           ▼                      │
┌─────────────────────┐           │
│ 4. IF Node          │           │
│ status=completed?   │           │
└──────────┬──────────┘           │
           │                      │
     ┌─────┴─────┐                │
     │           │                │
    YES          NO               │
     │           │                │
     │           ▼                │
     │    ┌─────────────┐         │
     │    │ Wait 5s     │─────────┘
     │    └─────────────┘
     │
     ▼
┌─────────────────────┐
│ 5. Signaliz Node    │
│ (Get Results)       │
│ Input: task_id      │
└─────────────────────┘
```

**Configuration:**
```json
{
  "nodes": [
    {
      "name": "Start Research",
      "type": "n8n-nodes-signaliz.signaliz",
      "parameters": {
        "resource": "Deep Research",
        "operation": "Find Companies",
        "description": "B2B SaaS companies hiring data engineers",
        "targetCount": 25
      }
    },
    {
      "name": "Loop",
      "type": "n8n-nodes-base.loop",
      "parameters": {
        "maxIterations": 60,
        "loopMode": "untilCondition"
      }
    },
    {
      "name": "Check Status",
      "type": "n8n-nodes-signaliz.signaliz",
      "parameters": {
        "resource": "Tasks",
        "operation": "Get Status",
        "taskId": "={{ $('Start Research').item.json.task_id }}"
      }
    },
    {
      "name": "Is Complete",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.status }}",
              "operation": "equals",
              "value2": "completed"
            }
          ]
        }
      }
    },
    {
      "name": "Wait",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": 5,
        "unit": "seconds"
      }
    },
    {
      "name": "Get Results",
      "type": "n8n-nodes-signaliz.signaliz",
      "parameters": {
        "resource": "Tasks",
        "operation": "Get Results",
        "taskId": "={{ $('Start Research').item.json.task_id }}"
      }
    }
  ]
}
```

### Pattern 3: Webhook-Based (Future Enhancement)

**Use Case:** Long-running tasks with webhook notification

```
┌─────────────────────┐
│ 1. Webhook Node     │
│ (Listen for result) │
│ Returns: webhook_url│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Signaliz Node    │
│ (Start Research)    │
│ webhook_url param   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. Wait for Webhook │
│ (Triggered by       │
│  Signaliz backend)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. Process Results  │
│ (Webhook payload    │
│  contains results)  │
└─────────────────────┘
```

**Note:** This requires webhook support in Signaliz API (not yet implemented)

### Pattern 4: Batch Processing with Error Handling

**Use Case:** Process multiple companies with retry logic

```
┌─────────────────────┐
│ 1. Split in Batches │
│ (10 companies)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. For Each Company │◄──────────┐
└──────────┬──────────┘           │
           │                      │
           ▼                      │
┌─────────────────────┐           │
│ 3. Start Research   │           │
│ (Returns task_id)   │           │
└──────────┬──────────┘           │
           │                      │
           ▼                      │
┌─────────────────────┐           │
│ 4. Poll Status      │           │
│ (Loop until done)   │           │
└──────────┬──────────┘           │
           │                      │
           ▼                      │
┌─────────────────────┐           │
│ 5. Error Handler    │           │
│ (Retry if failed)   │───────────┘
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 6. Get Results      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 7. Aggregate        │
│ (Combine all)       │
└─────────────────────┘
```

### Best Practices

#### Polling Intervals

| Task Type | Estimated Time | Recommended Interval | Max Iterations |
|-----------|----------------|---------------------|----------------|
| Single Company (Agentic) | 30-90s | 5s | 30 (2.5 min) |
| Single Company (Multipass) | 20-60s | 5s | 20 (1.7 min) |
| Bulk Discovery (10 companies) | 20-40s | 5s | 15 (1.25 min) |
| Bulk Discovery (25 companies) | 60-120s | 10s | 20 (3.3 min) |
| Deep Research (25 companies) | 120-180s | 10s | 30 (5 min) |

#### Timeout Handling

```javascript
// In n8n Function node
const taskId = $input.item.json.task_id;
const startTime = $input.item.json.created_at;
const maxWaitSeconds = 300; // 5 minutes

const elapsedSeconds = (Date.now() - new Date(startTime)) / 1000;

if (elapsedSeconds > maxWaitSeconds) {
  throw new Error(`Task ${taskId} exceeded maximum wait time of ${maxWaitSeconds}s`);
}

return { task_id: taskId };
```

#### Error Recovery

```javascript
// In n8n Function node for error handling
const status = $input.item.json.status;
const error = $input.item.json.error;

if (status === 'failed') {
  // Check if retryable
  if (error.includes('timeout') || error.includes('rate limit')) {
    return {
      retry: true,
      wait_seconds: 30,
      task_id: $input.item.json.task_id
    };
  } else {
    throw new Error(`Task failed: ${error}`);
  }
}

return $input.item.json;
```

---

## 5. Technical Implementation Details

### Manus API Field Mapping

| Manus Field | Signaliz Field | Notes |
|-------------|----------------|-------|
| `id` | `task_id` | Unique task identifier |
| `status` | `status` | Map: pending→pending, running→running, completed→completed, failed→failed |
| `created_at` | `created_at` | Unix timestamp → ISO 8601 |
| `updated_at` | `updated_at` | Unix timestamp → ISO 8601 |
| `credit_usage` | `credits_consumed` | Also used for `execution_time_seconds` |
| `model` | `model_used` | AI model identifier |
| `output` | `results` | Requires parsing (see below) |
| `error` | `error_details` | Error message if failed |

### Parsing Task Output

Manus returns output as an array of messages:

```javascript
{
  "output": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Find 25 B2B SaaS companies hiring data engineers"
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "{\"companies\": [{\"name\": \"Example Corp\", ...}]}"
        }
      ]
    }
  ]
}
```

**Extraction Strategy:**
1. Iterate through `output` array in reverse (latest first)
2. Find messages with `role: "assistant"`
3. Look for `content` items with `type: "output_text"`
4. Try to parse `text` as JSON
5. If JSON parsing fails, use markdown parser
6. Extract company data from parsed structure

### Workspace/API Key Validation

**On every request:**
1. Extract Bearer token from `Authorization` header
2. Look up workspace by API key in database
3. Verify workspace is active and has credits
4. Check task belongs to workspace (for status/results endpoints)
5. Return 401 if invalid, 403 if wrong workspace

```javascript
async function validateRequest(apiKey, taskId = null) {
  // 1. Find workspace
  const workspace = await db.workspaces.findOne({ api_key: apiKey });

  if (!workspace) {
    return { valid: false, status: 401, error: "Invalid API key" };
  }

  if (!workspace.active) {
    return { valid: false, status: 403, error: "Workspace inactive" };
  }

  // 2. If task_id provided, verify ownership
  if (taskId) {
    const task = await db.tasks.findOne({ task_id: taskId });

    if (!task) {
      return { valid: false, status: 404, error: "Task not found" };
    }

    if (task.workspace_id !== workspace.id) {
      return { valid: false, status: 403, error: "Task belongs to different workspace" };
    }
  }

  return { valid: true, workspace };
}
```

### Credit Charging

**Important:** Credits are charged during task execution, NOT during status checks or results retrieval.

| Operation | Credit Charge | When Charged |
|-----------|---------------|--------------|
| Start async task | 0 | Task creation |
| Status check | 0 | Never |
| Results retrieval | 0 | Never |
| Task execution | 1 credit/second | During execution |

**Charging Flow:**
1. Task starts: 0 credits charged
2. Task runs: Manus tracks execution time
3. Task completes: Manus reports `credit_usage`
4. Signaliz deducts credits from workspace balance
5. Status/results calls: 0 credits (already paid)

**Implementation:**
```javascript
async function handleTaskCompletion(taskId) {
  // Called by webhook from Manus when task completes
  const manusData = await fetchManusTask(taskId);
  const task = await db.tasks.findOne({ task_id: taskId });

  const creditsUsed = manusData.credit_usage || 0;

  // Deduct credits from workspace
  await db.workspaces.updateOne(
    { id: task.workspace_id },
    { $inc: { credits_balance: -creditsUsed } }
  );

  // Update task record
  await db.tasks.updateOne(
    { task_id: taskId },
    {
      $set: {
        status: 'completed',
        credits_consumed: creditsUsed,
        completed_at: new Date()
      }
    }
  );
}
```

---

## 6. Quick Reference for Josh

### Checklist for Implementation

#### Status Endpoint (`GET /v1/tasks/{task_id}/status`)

- [ ] Add route handler in Supabase Edge Function
- [ ] Validate API key and workspace
- [ ] Verify task belongs to workspace
- [ ] Call Manus API: `GET https://api.manus.ai/v1/tasks/{task_id}`
- [ ] Transform Manus response to Signaliz format
- [ ] Map status values: pending/running/completed/failed
- [ ] Extract progress info (companies_found, elapsed_seconds)
- [ ] Return appropriate HTTP status codes
- [ ] Add error handling for all edge cases
- [ ] Test with all operation types

#### Results Endpoint (`GET /v1/tasks/{task_id}/results`)

- [ ] Add route handler in Supabase Edge Function
- [ ] Validate API key and workspace
- [ ] Verify task belongs to workspace
- [ ] Check if results cached in Signaliz DB
- [ ] If not cached, call Manus API
- [ ] Verify task status is 'completed'
- [ ] Parse Manus output array
- [ ] Extract company data from assistant messages
- [ ] Handle JSON and markdown formats
- [ ] Transform to operation-specific format
- [ ] Cache results in Signaliz DB
- [ ] Return formatted results
- [ ] Add error handling for incomplete tasks
- [ ] Test with all operation types

### Testing Scenarios

1. **Happy Path:**
   - Start task → Poll status → Get results
   - Verify all fields present and correct

2. **Task Not Found:**
   - Request status/results for invalid task_id
   - Expect 404 error

3. **Wrong Workspace:**
   - Request task from different workspace
   - Expect 403 error

4. **Task Still Running:**
   - Request results before completion
   - Expect 400 error with current status

5. **Task Failed:**
   - Request results for failed task
   - Expect error details in response

6. **Caching:**
   - Request results twice
   - Second request should be faster (cached)

### Example Manus API Calls

```bash
# Get task status
curl -X GET \
  https://api.manus.ai/v1/tasks/TjyEVFNxIeUmsUYb4f2lpb \
  -H "API_KEY: your_manus_api_key"

# Response
{
  "id": "TjyEVFNxIeUmsUYb4f2lpb",
  "status": "completed",
  "created_at": 1736938200,
  "updated_at": 1736938267,
  "credit_usage": 67,
  "model": "anthropic/claude-sonnet-4.5",
  "output": [...]
}
```

---

## 7. n8n Node Implementation Notes

### New Resource: "Tasks"

Add a new resource type to the Signaliz node:

```typescript
{
  name: 'Tasks',
  value: 'tasks',
  description: 'Manage async task status and results'
}
```

### New Operations

#### Get Status
```typescript
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['tasks']
    }
  },
  options: [
    {
      name: 'Get Status',
      value: 'getStatus',
      description: 'Check the status of an async task',
      action: 'Get task status'
    }
  ]
}
```

#### Get Results
```typescript
{
  name: 'Get Results',
  value: 'getResults',
  description: 'Retrieve results from a completed task',
  action: 'Get task results'
}
```

### Task ID Parameter

```typescript
{
  displayName: 'Task ID',
  name: 'taskId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['tasks'],
      operation: ['getStatus', 'getResults']
    }
  },
  default: '',
  description: 'The task ID returned from an async operation',
  placeholder: 'TjyEVFNxIeUmsUYb4f2lpb'
}
```

### Implementation in execute() method

```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];
  const resource = this.getNodeParameter('resource', 0) as string;
  const operation = this.getNodeParameter('operation', 0) as string;

  for (let i = 0; i < items.length; i++) {
    try {
      if (resource === 'tasks') {
        if (operation === 'getStatus') {
          const taskId = this.getNodeParameter('taskId', i) as string;

          const response = await this.helpers.httpRequest({
            method: 'GET',
            url: `https://api.signaliz.com/functions/v1/tasks/${taskId}/status`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json'
            }
          });

          returnData.push({ json: response });

        } else if (operation === 'getResults') {
          const taskId = this.getNodeParameter('taskId', i) as string;

          const response = await this.helpers.httpRequest({
            method: 'GET',
            url: `https://api.signaliz.com/functions/v1/tasks/${taskId}/results`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json'
            }
          });

          returnData.push({ json: response });
        }
      }
      // ... other resources
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message } });
        continue;
      }
      throw error;
    }
  }

  return [returnData];
}
```

---

## Summary

This guide provides:

✅ **Complete async operation lifecycle** with real response examples
✅ **Detailed endpoint specifications** for status and results
✅ **Implementation code** for Josh to proxy Manus API
✅ **Field mapping** between Manus and Signaliz formats
✅ **n8n workflow patterns** for polling and error handling
✅ **Best practices** for intervals, timeouts, and retries
✅ **Testing scenarios** to ensure robustness

**Next Steps:**
1. Josh implements the two endpoints in Supabase Edge Functions
2. Test endpoints with real Manus tasks
3. Update n8n node to add Tasks resource
4. Create example workflows for users
5. Document polling patterns in user guide


